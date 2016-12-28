import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { AudioVersionModel } from './audio-version.model';
import { ImageModel } from './image.model';
import { REQUIRED, LENGTH } from './invalid';

export class StoryModel extends BaseModel {

  public id: number;
  public title: string;
  public shortDescription: string;
  public description: string;
  public tags: string;
  public updatedAt: Date;
  public publishedAt: Date;
  public versions: AudioVersionModel[] = [];
  public images: ImageModel[] = [];
  public isPublishing: boolean;
  public account: HalDoc;

  SETABLE = ['title', 'shortDescription', 'description', 'tags', 'publishedAt'];

  VALIDATORS = {
    title:            [REQUIRED()],
    shortDescription: [REQUIRED()],
    description:      [LENGTH(10)]
  };

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

    // existing story: splice in unsaved image
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
      images = this.doc.followItems('prx:images').map(idocs => {
        let models = idocs.map(idoc => new ImageModel(this.parent, this.doc, idoc));
        return this.unsavedImage ? models.concat(this.unsavedImage) : models;
      });
    }

    // new story-in-series with templates: init versions from templates
    if (!this.doc && this.parent && this.parent.count('prx:audio-version-templates')) {
      versions = this.parent.followItems('prx:audio-version-templates').map(tdocs => {
        return tdocs.map(tdoc => new AudioVersionModel({series: this.parent, template: tdoc}));
      });
    }

    // defaults
    if (!versions) {
      versions = Observable.of([new AudioVersionModel({series: this.parent})]);
    }
    if (!images) {
      images = this.unsavedImage ? Observable.of([this.unsavedImage]) : Observable.of([]);
    }
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
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.shortDescription = this.shortDescription;
    data.descriptionMd = this.description;
    data.tags = this.splitTags();
    data.publishedAt = this.publishedAt;
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

  get unsavedImage(): ImageModel {
    let img = new ImageModel(this.parent, this.doc, null);
    return img.isStored() && !img.isDestroy ? img : null;
  }

  splitTags(): string[] {
    return (this.tags || '').split(',').map(t => t.trim()).filter(t => t);
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }

}
