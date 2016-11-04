import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { ImageModel } from './image.model';
import { AudioVersionTemplateModel } from './audio-version-template.model';
import { REQUIRED, LENGTH } from './invalid';

export class SeriesModel extends BaseModel {

  public id: number;
  public title: string = '';
  public description: string = '';
  public shortDescription: string = '';
  public createdAt: Date;
  public updatedAt: Date;
  public images: ImageModel[] = [];
  public versionTemplates: AudioVersionTemplateModel[] = [];

  SETABLE = ['title', 'description', 'shortDescription'];

  VALIDATORS = {
    title:            [REQUIRED(), LENGTH(10)],
    description:      [LENGTH(10)],
    shortDescription: [REQUIRED(), LENGTH(10)]
  };

  constructor(account: HalDoc, series?: HalDoc, loadRelated = true) {
    super();
    this.init(account, series, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.series.${this.doc.id}`;
    } else {
      return `prx.series.new.${this.parent.id}`; // new in series
    }
  }

  related() {
    let images = Observable.of([]);
    let templates = Observable.of([]);

    if (this.doc && this.doc.has('prx:image')) {
      images = this.doc.follow('prx:image').map(idoc => {
        let imageModels = [new ImageModel(this.parent, this.doc, idoc)];
        if (this.unsavedImage) {
          imageModels.push(this.unsavedImage);
        }
        return imageModels;
      });
    } else if (this.unsavedImage) {
      images = Observable.of([this.unsavedImage]);
    }

    if (this.doc && this.doc.count('prx:audio-version-templates')) {
      templates = this.doc.followItems('prx:audio-version-templates').map(tdocs => {
        return tdocs.map(t => new AudioVersionTemplateModel(this.doc, t));
      });
    } else if (this.unsavedVersionTemplate) {
      templates = Observable.of([this.unsavedVersionTemplate]);
    }

    return {
      images: images,
      versionTemplates: templates
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.description = this.doc['description'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.createdAt = new Date(this.doc['createdAt']);
    this.updatedAt = new Date(this.doc['updatedAt']);
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.description = this.description;
    data.shortDescription = this.shortDescription;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:series', {}, data);
  }

  saveRelated(): Observable<boolean[]> {
    let hasNewImage = this.images.find(i => i.isNew && !i.isDestroy);

    // since series only has 1 image, just fire off the POST for the new image
    // without DELETE-ing the old one.
    if (hasNewImage) {
      this.images = this.images.filter(img => {
        if (!img.isNew && img.isDestroy) {
          img.unstore();
          return false;
        } else {
          return true;
        }
      });
    }
    return super.saveRelated();
  }

  get unsavedImage(): ImageModel {
    let img = new ImageModel(this.parent, this.doc, null);
    return img.isStored() && !img.isDestroy ? img : null;
  }

  get unsavedVersionTemplate(): AudioVersionTemplateModel {
    let tpl = new AudioVersionTemplateModel(this.doc, null);
    return tpl.isStored() && !tpl.isDestroy ? tpl : null;
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }

}
