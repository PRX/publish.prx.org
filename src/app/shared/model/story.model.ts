import { Observable} from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from './base.model';
import { AudioVersionModel } from './audio-version.model';
import { ImageModel } from './image.model';
import { REQUIRED, LENGTH } from './invalid';
import { HasUpload, applyMixins } from './upload';

export class StoryModel extends BaseModel implements HasUpload {

  public id: number;
  public title: string;
  public shortDescription: string;
  public description: string;
  public tags: string;
  public updatedAt: Date;
  public publishedAt: Date;
  public releasedAt: Date;
  public versions: AudioVersionModel[] = [];
  public images: ImageModel[] = [];
  public isPublishing: boolean;
  public account: HalDoc;

  SETABLE = ['title', 'shortDescription', 'description', 'tags', 'hasUploadMap', 'releasedAt'];

  VALIDATORS = {
    title:            [REQUIRED()],
    shortDescription: [REQUIRED()],
    description:      [LENGTH(10)]
  };

  // HasUpload mixin
  hasUploadMap: string;
  getUploads: (rel: string) => Observable<(HalDoc|string)[]>;
  setUploads: (rel: string, uuids?: string[]) => void;

  constructor(seriesOrAccount: HalDoc, story?: HalDoc, loadRelated = true) {
    super();
    if (seriesOrAccount && seriesOrAccount.isa('series')) {
      this.init(seriesOrAccount, story, loadRelated);
    } else {
      this.account = seriesOrAccount;
      this.init(null, story, loadRelated);
    }
  }

  key() {
    if (this.doc) {
      return `prx.story.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.story.new.${this.parent.id}`; // new in series
    } else {
      return 'prx.story.new'; // new standalone
    }
  }

  related() {
    let versions: Observable<AudioVersionModel[]>;
    let images: Observable<ImageModel[]>;

    // audio versions (with optional templates)
    if (this.doc) {
      versions = this.doc.followItems('prx:audio-versions').flatMap(vdocs => {
        return Observable.from(vdocs.map(vdoc => {
          if (vdoc.has('prx:audio-version-template')) {
            return vdoc.follow('prx:audio-version-template').map(tdoc => {
              return new AudioVersionModel({story: this.doc, version: vdoc, template: tdoc});
            });
          } else {
            return Observable.of(new AudioVersionModel({story: this.doc, version: vdoc}));
          }
        })).concatAll().toArray();
      });
    } else if (!this.doc && this.parent && this.parent.count('prx:audio-version-templates')) {
      versions = this.parent.followItems('prx:audio-version-templates').map(tdocs => {
        return tdocs.map(tdoc => new AudioVersionModel({series: this.parent, template: tdoc}));
      });
    } else {
      versions = Observable.of([new AudioVersionModel({series: this.parent})]);
    }

    // image uploads
    images = this.getUploads('prx:images').map(idocs => {
      let models = idocs.map(docOrUuid => new ImageModel(this.doc, docOrUuid));
      this.setUploads('prx:images', models.map(m => m.uuid));
      return models;
    });

    return {images: images, versions: versions};
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.description = this.doc['descriptionMd'] || '';
    this.tags = (this.doc['tags'] || []).join(', ');
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.publishedAt = this.doc['publishedAt'] ? new Date(this.doc['publishedAt']) : null;
    this.releasedAt = this.doc['releasedAt'] ? new Date(this.doc['releasedAt']) : null;
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.shortDescription = this.shortDescription;
    data.descriptionMd = this.description;
    data.tags = this.splitTags();
    data.releasedAt = this.releasedAt;
    // Setting the publishedAt because it updates with releasedAt in CMS
    // We are using a PUT for the update, which does not have a body, so we're not picking up the change
    if (this.publishedAt && this.releasedAt) {
      this.publishedAt = this.releasedAt;
      this.doc['publishedAt'] = this.releasedAt;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    if (this.parent) {
      return this.parent.create('prx:stories', {}, data);
    } else {
      return this.account.create('prx:stories', {}, data);
    }
  }

  setPublished(published: boolean): Observable<boolean> {
    if (!published && this.doc.has('prx:unpublish')) {
      this.isPublishing = true;
      return this.doc.follow('prx:unpublish', {method: 'post'}).map(doc => {
        this.init(this.parent, doc, false);
        this.isPublishing = false;
        return false;
      });
    } else if (published && this.doc.has('prx:publish')) {
      this.isPublishing = true;
      return this.doc.follow('prx:publish', {method: 'post'}).map(doc => {
        this.init(this.parent, doc, false);
        this.isPublishing = false;
        return true;
      });
    } else {
      return Observable.of(null);
    }
  }

  addImage(upload: Upload): ImageModel {
    let image = new ImageModel(this.doc, upload);
    this.images = [...this.images, image];
    this.setUploads('prx:images', this.images.map(i => i.uuid));
    return image;
  }

  removeImage(image: ImageModel) {
    if (image.isNew) {
      this.images = this.images.filter(i => i !== image);
    } else {
      this.images = [...this.images]; // trigger change detection
    }
    this.setUploads('prx:images', this.images.map(i => i.uuid));
  }

  splitTags(): string[] {
    return (this.tags || '').split(',').map(t => t.trim()).filter(t => t);
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }

}

applyMixins(StoryModel, [HasUpload]);
