import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { AudioVersionModel } from './audio-version.model';
import { ImageModel } from './image.model';
import { REQUIRED, LENGTH } from './base.invalid';

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

  SETABLE = ['title', 'shortDescription', 'description', 'tags'];

  VALIDATORS = {
    title:            [REQUIRED(), LENGTH(10)],
    shortDescription: [REQUIRED(), LENGTH(10)],
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
    if (this.doc) {
      return {
        versions: this.doc.followItems('prx:audio-versions').map((versions) => {
          return versions.map((vdoc) => {
            return new AudioVersionModel(this.parent, this.doc, vdoc);
          });
        }),
        images: this.doc.followItems('prx:images').map((images) => {
          let imageModels = images.map(idoc => new ImageModel(this.parent, this.doc, idoc));
          if (this.unsavedImage) { imageModels.push(this.unsavedImage); }
          return imageModels;
        })
      };
    } else {
      return {
        versions: Observable.of([new AudioVersionModel(this.parent)]),
        images: this.unsavedImage ? Observable.of([this.unsavedImage]) : Observable.of([])
      };
    }
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.description = this.doc['description'] || '';
    this.tags = (this.doc['tags'] || []).join(', ');
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.publishedAt = this.doc['publishedAt'] ? new Date(this.doc['publishedAt']) : null;
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.shortDescription = this.shortDescription;
    data.description = this.description;
    data.tags = this.splitTags();
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
