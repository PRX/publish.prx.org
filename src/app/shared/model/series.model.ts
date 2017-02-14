import { Observable} from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from './base.model';
import { ImageModel } from './image.model';
import { AudioVersionTemplateModel } from './audio-version-template.model';
import { AudioFileTemplateModel } from './audio-file-template.model';
import { DistributionModel } from './distribution.model';
import { REQUIRED, LENGTH } from './invalid';
import { HasUpload, applyMixins } from './upload';

export class SeriesModel extends BaseModel implements HasUpload {

  public id: number;
  public title = '';
  public description = '';
  public shortDescription = '';
  public createdAt: Date;
  public updatedAt: Date;
  public images: ImageModel[] = [];
  public versionTemplates: AudioVersionTemplateModel[] = [];
  public distributions: DistributionModel[] = [];
  public accountId: number;
  public hasStories: boolean;

  SETABLE = ['title', 'description', 'shortDescription', 'hasUploadMap', 'accountId'];

  VALIDATORS = {
    title:            [REQUIRED(), LENGTH(1, 255)],
    shortDescription: [REQUIRED()]
  };

  // HasUpload mixin
  hasUploadMap: string;
  getUploads: (rel: string) => Observable<(HalDoc|string)[]>;
  setUploads: (rel: string, uuids?: string[]) => void;

  constructor(account: HalDoc, series?: HalDoc, loadRelated = true) {
    super();
    this.init(account, series, loadRelated);
    this.set('accountId', account.id, true);
    this.hasStories = series ? series.count('prx:stories') > 0 : false;
    this.loadRelated('versionTemplates').subscribe(() => {
      if (this.isNew && this.versionTemplates.length === 0) {
        this.defaultVersionTemplate();
      }
    });
  }

  key() {
    if (this.doc) {
      return `prx.series.${this.doc.id}`;
    } else {
      return `prx.series.new`; // new in series
    }
  }

  related() {
    let images = Observable.of([]);
    let templates = Observable.of([]);
    let distributions = Observable.of([]);

    // image uploads
    images = this.getUploads('prx:images').map(idocs => {
      let models = idocs.map(docOrUuid => new ImageModel(this.doc, docOrUuid));
      this.setUploads('prx:images', models.map(m => m.uuid));
      return models;
    });

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
        return ddocs.map(d => new DistributionModel(this.doc, d))
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

  discard(): any {
    super.discard();
    if (this.isNew) {
      this.defaultVersionTemplate();
    }
  }

  changed(field?: string | string[], includeRelations = true): boolean {
    if (this.isNew && this.versionTemplates.length !== 1) {
      return true; // default version template was deleted!
    } else {
      return super.changed(field, includeRelations);
    }
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
    if (this.changed('accountId')) {
      data.set_account_uri = `api/v1/accounts/${this.accountId}`;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:series', {}, data);
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

  defaultVersionTemplate() {
    let tpl = new AudioVersionTemplateModel();
    tpl.set('label', 'Podcast Audio', true);
    let file = new AudioFileTemplateModel(null, null, 1);
    file.set('label', 'Main Segment', true);
    tpl.fileTemplates.push(file);
    this.versionTemplates = [tpl];
  }

  get unsavedVersionTemplate(): AudioVersionTemplateModel {
    let tpl = new AudioVersionTemplateModel(this.doc);
    return tpl.isStored() && !tpl.isDestroy ? tpl : null;
  }

  get unsavedDistribution(): DistributionModel {
    let dist = new DistributionModel(this.doc);
    return dist.isStored() && !dist.isDestroy ? dist : null;
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }

}

applyMixins(SeriesModel, [HasUpload]);
