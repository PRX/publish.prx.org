import {Observable} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {UploadableModel} from '../../shared/model/uploadable.model';
import {Upload} from '../../upload/services/upload.service';

export class AudioFileModel extends UploadableModel {

  public id: number;
  public label: string;
  public duration: number;
  public position: number;
  public status: string;

  SETABLE = ['label', 'duration', 'position', 'isDestroy'];

  constructor(audioVersion?: HalDoc, file?: HalDoc | Upload | string) {
    super();
    this.initUpload(audioVersion, file);
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
    this.status = this.doc['status'];
  }

  encode(): {} {
    let data = super.encode();
    data['label'] = this.label;
    data['duration'] = this.duration;
    data['position'] = this.position;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio', {}, data);
  }

  destroy() {
    this.set('isDestroy', true);
    super.destroy();
    if (this.isNew) {
      this.unstore();
    }
  }

}
