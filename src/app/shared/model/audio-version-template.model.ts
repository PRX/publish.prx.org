import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED, LENGTH } from './invalid';
import { AudioFileTemplateModel } from './audio-file-template.model';

export class AudioVersionTemplateModel extends BaseModel {

  public id: number;
  public label: string;
  public lengthMinimum: number;
  public lengthMaximum: number;
  public fileTemplates: AudioFileTemplateModel[];

  SETABLE = ['label', 'lengthMinimum', 'lengthMaximum'];

  VALIDATORS = {
    label: [REQUIRED(), LENGTH(3)]
  };

  constructor(series: HalDoc, versionTemplate?: HalDoc, loadRelated = true) {
    super();
    this.VALIDATORS['lengthMinimum'] = [(k: string, v: any) => this.validateMinimum(v)];
    this.VALIDATORS['lengthMaximum'] = [(k: string, v: any) => this.validateMaximum(v)];
    this.init(series, versionTemplate, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.audio-version-template.${this.doc.id}`;
    } else {
      return `prx.audio-version-template.new.${this.parent.id}`;
    }
  }

  related() {
    let files = Observable.of([]);
    if (this.doc) {
      files = this.doc.followList('prx:audio-file-templates').map(ftdocs => {
        return ftdocs.map(ft => new AudioFileTemplateModel(this.doc, ft));
      });
    }
    return {
      fileTemplates: files
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.label = this.doc['label'] || '';
    this.lengthMinimum = this.doc['lengthMinimum'] || null;
    this.lengthMaximum = this.doc['lengthMaximum'] || null;
  }

  encode(): {} {
    let data = <any> {};
    data.label = this.label;
    data.lengthMinimum = this.lengthMinimum || 0;
    data.lengthMaximum = this.lengthMaximum || 0;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio-version-templates', {}, data);
  }

  validateMinimum(value: any, checkMax = true): string {
    if (checkMax) {
      this.invalidFields['lengthMaximum'] = this.validateMaximum(this.lengthMaximum, false);
    }
    if (this.lengthMaximum === null && value === null) {
      return null; // allow unset
    } else if (value === null) {
      return 'Must set a minimum';
    } else if (isNaN(parseInt(value, 10))) {
      return 'Minimum is not a number';
    } else if (value < 1) {
      return 'Minimum must be greater than 0';
    } else if (value >= this.lengthMaximum) {
      return 'Minimum must be less than maximum';
    }
  }

  validateMaximum(value: any, checkMin = true): string {
    if (checkMin) {
      this.invalidFields['lengthMinimum'] = this.validateMinimum(this.lengthMinimum, false);
    }
    if (this.lengthMinimum === null && value === null) {
      return null; // allow unset
    } else if (value === null) {
      return 'Must set a maximum';
    } else if (isNaN(parseInt(value, 10))) {
      return 'Maximum is not a number';
    } else if (value < 1) {
      return 'Maximum must be greater than 0';
    } else if (value <= this.lengthMinimum) {
      return 'Maximum must be greater than minimum';
    }
  }

  invalid(field?: string | string[]): string {
    if (field === 'lengthAny') {
      return this.invalid('lengthMinimum') || this.invalid('lengthMaximum');
    } else {
      return super.invalid(field);
    }
  }

}
