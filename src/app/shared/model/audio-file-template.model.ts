import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED, LENGTH, FILE_LENGTH } from './invalid';

export class AudioFileTemplateModel extends BaseModel {

  public id: number;
  public position: number = null;
  public label: string = null;
  public lengthMinimum: number = null;
  public lengthMaximum: number = null;

  private series: HalDoc;

  SETABLE = ['position', 'label', 'lengthMinimum', 'lengthMaximum'];

  VALIDATORS = {
    label: [REQUIRED(), LENGTH(1, 255)],
    lengthMinimum: [FILE_LENGTH(this)],
    lengthMaximum: [FILE_LENGTH(this)]
  };

  constructor(series: HalDoc, versionTemplate?: HalDoc, fileOrPosition?: HalDoc | number) {
    super();
    this.series = series;
    if (typeof(fileOrPosition) === 'number') {
      this.position = fileOrPosition;
      this.init(versionTemplate);
    } else {
      this.init(versionTemplate, fileOrPosition);
    }
  }

  key() {
    if (this.doc) {
      return `prx.audio-file-template.${this.doc.id}`;
    } else if (this.parent && this.position) {
      return `prx.audio-file-template.${this.parent.id}.${this.position}`;
    } else if (this.series && this.position) {
      return `prx.audio-file-template.series.${this.series.id}.${this.position}`;
    } else if (this.position) {
      return `prx.audio-file-template.series.new.${this.position}`;
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.position = this.doc['position'] || null;
    this.label = this.doc['label'] || '';
    this.lengthMinimum = this.doc['lengthMinimum'] || null;
    this.lengthMaximum = this.doc['lengthMaximum'] || null;
  }

  encode(): {} {
    let data = <any> {};
    data.position = this.position;
    data.label = this.label;
    data.lengthMinimum = this.lengthMinimum || 0;
    data.lengthMaximum = this.lengthMaximum || 0;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio-file-templates', {}, data);
  }

  invalid(field?: string | string[]): string {
    if (field === 'lengthAny') {
      return this.invalid('lengthMinimum') || this.invalid('lengthMaximum');
    } else {
      return super.invalid(field);
    }
  }

}
