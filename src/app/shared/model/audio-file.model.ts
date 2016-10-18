import { Observable } from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { UploadableModel } from './uploadable.model';

export class AudioFileModel extends UploadableModel {

  public id: number;
  public label: string;
  public duration: number;
  public position: number;

  SETABLE = ['label', 'duration', 'position', 'isDestroy'];

  constructor(audioVersion?: HalDoc, file?: HalDoc | Upload | string) {
    super();
    this.initUpload(audioVersion, file);
    if (file instanceof Upload) {
      this.set('duration', file.duration);
    }
  }

  stateComplete(status: string): boolean {
    return status === 'complete';
  }

  stateError(status: string): string {
    if (this.status === 'not found') {
      return 'Unable to find file - please remove and try again';
    } else if (this.status === 'invalid') {
      return 'Not a valid audio file - please remove and try again';
    } else if (this.status === 'failed') {
      return 'Unable to process file - please remove and try again';
    }
  }

  key() {
    if (this.doc) {
      return `prx.audio-file.${this.doc.id}`;
    } else if (this.uuid) {
      return `prx.audio-file.new.${this.uuid}`;
    } else {
      return `prx.audio-file.new`;
    }
  }

  related() {
    return {};
  }

  decode() {
    super.decode();
    this.id = this.doc['id'];
    this.label = this.doc['label'];
    this.duration = this.doc['duration'];
    this.position = this.doc['position'];
  }

  encode(): {} {
    let data = super.encode();
    data['label'] = this.label;
    data['duration'] = this.duration;
    data['position'] = this.position;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio', {}, data).map(doc => {
      this.setState();
      this.watchProcess();
      return doc;
    });
  }

}
