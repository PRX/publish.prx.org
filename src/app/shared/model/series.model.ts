import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { ImageModel } from './image.model';
import { AudioVersionTemplateModel } from './audio-version-template.model';
import { AudioFileTemplateModel } from './audio-file-template.model';
import { DistributionModel } from './distribution.model';
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
  public distributions: DistributionModel[] = [];

  SETABLE = ['title', 'description', 'shortDescription'];

  VALIDATORS = {
    title:            [REQUIRED()],
    description:      [LENGTH(10)],
    shortDescription: [REQUIRED()]
  };

  constructor(account: HalDoc, series?: HalDoc, loadRelated = true) {
    super();
    this.init(account, series, loadRelated);
    if (this.isNew && !this.changed()) {
      let versionTpl = new AudioVersionTemplateModel(account);
      let fileTpl = new AudioFileTemplateModel(null, null, 1);
      versionTpl.set('label', 'Podcast Audio');
      fileTpl.set('label', 'Main Segment');
      versionTpl.fileTemplates.push(fileTpl);
      this.versionTemplates.push(versionTpl);
    }
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
    let distributions = Observable.of([]);

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
        return tdocs.map(t => new AudioVersionTemplateModel(this.doc, t))
                    .concat(this.unsavedVersionTemplate).filter(t => t);
      });
    } else if (this.unsavedVersionTemplate) {
      templates = Observable.of([this.unsavedVersionTemplate]);
    }

    if (this.doc && this.doc.count('prx:distributions')) {
      distributions = this.doc.followItems('prx:distributions').map(ddocs => {
        return ddocs.map(d => new DistributionModel({series: this.doc, distribution: d}))
                    .concat(this.unsavedDistribution).filter(d => d);
      });
    } else if (this.unsavedDistribution) {
      distributions = Observable.of([this.unsavedDistribution]);
    }

    return {
      images: images,
      versionTemplates: templates,
      distributions: distributions
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.description = this.doc['descriptionMd'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.createdAt = new Date(this.doc['createdAt']);
    this.updatedAt = new Date(this.doc['updatedAt']);
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.descriptionMd = this.description;
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

  get unsavedDistribution(): DistributionModel {
    let dist = new DistributionModel({series: this.doc});
    return dist.isStored() && !dist.isDestroy ? dist : null;
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }

}
