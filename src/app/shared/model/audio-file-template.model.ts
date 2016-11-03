import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED, LENGTH, FILE_LENGTH } from './invalid';

export class AudioFileTemplateModel extends BaseModel {

  public id: number;
  public position: number;
  public label: string;
  public lengthMinimum: number;
  public lengthMaximum: number;

  SETABLE = ['position', 'label', 'lengthMinimum', 'lengthMaximum'];

  VALIDATORS = {
    label: [REQUIRED(), LENGTH(3)],
    lengthMinimum: [FILE_LENGTH(this)],
    lengthMaximum: [FILE_LENGTH(this)]
  };

  constructor(versionTemplate: HalDoc, fileTemplate?: HalDoc, loadRelated = true) {
    super();
    this.init(versionTemplate, fileTemplate, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.audio-file-template.${this.doc.id}`;
    } else {
      return `prx.audio-file-template.new.${this.parent.id}`;
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.position = this.doc['position'];
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
