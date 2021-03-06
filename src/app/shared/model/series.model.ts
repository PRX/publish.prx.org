import { of as observableOf, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalDoc } from '../../core';
import { BaseModel, ValidatorMap, REQUIRED, LENGTH } from 'ngx-prx-styleguide';
import { ImageModel } from './image.model';
import { SeriesImportModel } from './series-import.model';
import { DistributionModel } from './distribution.model';
import { AudioVersionTemplateModel, AudioFileTemplateModel } from 'ngx-prx-styleguide';
import { HasUpload, createGetUploads, createSetUploads } from 'ngx-prx-styleguide';
import { Upload } from 'ngx-prx-styleguide';

export const IMPORT_SERIES_VALIDATIONS: ValidatorMap = {
  importUrl: [REQUIRED()],
};

export const NEW_SERIES_VALIDATIONS: ValidatorMap  = {
    title:            [REQUIRED(), LENGTH(1, 255)],
    shortDescription: [REQUIRED()],
    description:      [LENGTH(0, 4000)],
    accountId:        [REQUIRED()]
};

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
  public importUrl: string;

  // An array of observables on series import instances
  // Load the series imports, then create a observable stream for each one
  // polling until we navigate away or the import finishes
  seriesImports: Observable<Observable<SeriesImportModel>[]> = null;

  SETABLE = ['title', 'description', 'shortDescription', 'hasUploadMap', 'accountId'];

  VALIDATORS: ValidatorMap = NEW_SERIES_VALIDATIONS;

  // HasUpload mixin
  hasUploadMap: string;
  get getUploads() {
    return createGetUploads();
  }
  get setUploads() {
    return createSetUploads();
  }

  constructor(account: HalDoc, series?: HalDoc, loadRelated = true) {
    super();
    this.init(account, series, loadRelated);
    if (account) {
      this.set('accountId', account.id, true);
    }
    this.hasStories = series ? series.count('prx:stories') > 0 : false;
    if (this.isNew) {
      this.loadRelated('versionTemplates').subscribe(() => {
        if (this.versionTemplates.length === 0) {
          this.defaultVersionTemplate();
        }
      });
    }
  }

  setComponentValidationStrategy(validations: any) {
    this.VALIDATORS = validations;
  }

  key() {
    if (this.doc) {
      return `prx.series.${this.doc.id}`;
    } else {
      return `prx.series.new`; // new in series
    }
  }

  related() {
    let images = observableOf([]);
    let templates = observableOf([]);
    let distributions = observableOf([]);

    // image uploads
    images = this.getUploads('prx:images').pipe(map(idocs => {
      let models = idocs.map(docOrUuid => new ImageModel(this.doc, docOrUuid));
      this.setUploads('prx:images', models.map(m => m.uuid));
      return models;
    }));

    if (this.doc && this.doc.count('prx:audio-version-templates')) {
      templates = this.doc.followItems('prx:audio-version-templates').pipe(map(tdocs => {
        return tdocs.map(t => new AudioVersionTemplateModel(this.doc, t))
                    .concat(this.unsavedVersionTemplates).filter(t => t);
      }));
    } else if (this.unsavedVersionTemplates) {
      templates = observableOf(this.unsavedVersionTemplates);
    }

    if (this.doc && this.doc.count('prx:distributions')) {
      distributions = this.doc.followItems('prx:distributions').pipe(map(ddocs => {
        return ddocs.map(d => new DistributionModel(this.doc, d))
                    .concat(this.unsavedDistribution).filter(d => d);
      }));
    } else if (this.unsavedDistribution) {
      distributions = observableOf([this.unsavedDistribution]);
    }

    return {
      images: images,
      versionTemplates: templates,
      distributions: distributions,
    };
  }

  discard(): any {
    if (this.changed('accountId')) {
      this.set('accountId', this.original['accountId']);
    }
    super.discard();
    if (this.isNew) {
      this.defaultVersionTemplate();
    }
  }

  changed(field?: string | string[], includeRelations = true): boolean {
    if (!field && this.isNew && this.versionTemplates.length !== 1) {
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
    if (this.importUrl) {
      data.import_url = this.importUrl;
    } else {
      data.title = this.title;
      data.descriptionMd = this.description;
      data.shortDescription = this.shortDescription;
      if (this.changed('accountId')) {
        const accountDoc = this.isNew ? this.parent.expand('self') : this.doc.expand('prx:account');
        let newAccountURI = accountDoc.replace(`${this.original['accountId']}`, `${this.accountId}`);
        data.set_account_uri = newAccountURI;
      }
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

  flushVersionTemplates() {
    this.versionTemplates = [];
  }

  defaultVersionTemplate() {
    let tpl = new AudioVersionTemplateModel(null, 0);
    tpl.set('label', 'Podcast Audio', true);
    tpl.addFile('Main Segment', true);
    this.versionTemplates = [tpl];
  }

  get unsavedVersionTemplates(): AudioVersionTemplateModel[] {
    let tpls = [];
    for (let i = 0; i < 20; i++) {
      let tpl = new AudioVersionTemplateModel(this.doc, i);
      if (tpl.isStored() && !tpl.isDestroy) {
        tpls.push(tpl);
      }
    }
    return tpls.length ? tpls : null;
  }

  get unsavedDistribution(): DistributionModel {
    let dist = new DistributionModel(this.doc);
    return dist.isStored() && !dist.isDestroy ? dist : null;
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }
}
