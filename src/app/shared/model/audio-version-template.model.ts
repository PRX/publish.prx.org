import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED, LENGTH, VERSION_LENGTH } from './invalid';
import { AudioFileTemplateModel } from './audio-file-template.model';

export class AudioVersionTemplateModel extends BaseModel {

  public id: number;
  public label: string;
  public lengthMinimum: number;
  public lengthMaximum: number;
  public fileTemplates: AudioFileTemplateModel[];

  SETABLE = ['label', 'lengthMinimum', 'lengthMaximum'];

  VALIDATORS = {
    label: [REQUIRED(), LENGTH(3)],
    lengthMinimum: [VERSION_LENGTH(this)],
    lengthMaximum: [VERSION_LENGTH(this)]
  };

  constructor(series: HalDoc, versionTemplate?: HalDoc, loadRelated = true) {
    super();
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

  invalid(field?: string | string[]): string {
    if (field === 'lengthAny') {
      return this.invalid('lengthMinimum') || this.invalid('lengthMaximum');
    } else {
      return super.invalid(field);
    }
  }

}
