import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from 'ngx-prx-styleguide';
import { AudioVersionModel } from './audio-version.model';
import { ImageModel } from './image.model';
import { StoryDistributionModel } from './story-distribution.model';
import { REQUIRED, LENGTH } from './invalid';
import { HasUpload, applyMixins } from './upload';

export class StoryModel extends BaseModel implements HasUpload {

  public id: number;
  public title: string; // show changes
  public shortDescription = '';
  public description = '';
  public tags = '';
  public status: string;
  public statusMessage: string;
  public updatedAt: Date;
  public publishedAt: Date;
  public releasedAt: Date;
  public versions: AudioVersionModel[] = [];
  public images: ImageModel[] = [];
  public account: HalDoc;
  public distributions: StoryDistributionModel[] = [];

  SETABLE = ['title', 'shortDescription', 'description', 'tags', 'hasUploadMap', 'releasedAt'];

  VALIDATORS = {
    title:            [REQUIRED(true), LENGTH(1, 255)],
    shortDescription: [REQUIRED()],
    description:      [LENGTH(0, 4000)]
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
    let distributions = Observable.of([]);

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

    // story distributions
    if (this.doc && this.doc.count('prx:distributions')) {
      distributions = this.doc.followItems('prx:distributions').map(ddocs => {
        return ddocs.map(d => new StoryDistributionModel(this.parent, this.doc, d));
      });
    } else if (this.isNew && this.parent) {
      distributions = this.getSeriesDistribution('podcast').map(dist => {
        if (dist) {
          let newEpisode = new StoryDistributionModel(this.parent, this.doc);
          newEpisode.set('kind', 'episode', true);
          return [newEpisode];
        } else {
          return [];
        }
      });
    }

    return {images: images, versions: versions, distributions: distributions};
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.description = this.doc['descriptionMd'] || '';
    this.tags = (this.doc['tags'] || []).join(', ');
    this.status = this.doc['status'];
    this.statusMessage = this.doc['statusMessage'];
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
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    if (this.parent) {
      return this.parent.create('prx:stories', {}, data);
    } else {
      return this.account.create('prx:stories', {}, data);
    }
  }

  // clear status messages, as it's easier than refreshing
  saveRelated(): Observable<boolean[]> {
    if (this.changed('files')) {
      this.status = null;
      this.statusMessage = null;
    }
    return super.saveRelated();
  }

  setPublished(published: boolean): Observable<boolean> {
    if (!published && this.doc.has('prx:unpublish')) {
      return this.doc.follow('prx:unpublish', {method: 'post'}).map(doc => {
        this.init(this.parent, doc, false);
        return false;
      });
    } else if (published && this.doc.has('prx:publish')) {
      return this.doc.follow('prx:publish', {method: 'post'}).map(doc => {
        this.init(this.parent, doc, false);
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

  isPublished(bufferSeconds = 0): boolean {
    if (this.publishedAt) {
      return new Date().valueOf() >= this.publishedAt.valueOf() + (bufferSeconds * 1000);
    } else {
      return false;
    }
  }

  getSeriesDistribution(kind: string): Observable<HalDoc> {
    if (this.parent && this.parent.count('prx:distributions')) {
      return this.parent.followItems('prx:distributions').map(dists => {
        return dists.find(d => d['kind'] === kind);
      });
    } else {
      return Observable.of(null);
    }
  }

}

applyMixins(StoryModel, [HasUpload]);
