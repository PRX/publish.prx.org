import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HalDoc, Upload } from '../../core';
import { UploadableModel } from './upload';
import { REQUIRED, LENGTH, FILE_TEMPLATED } from './invalid';

export class AudioFileModel extends UploadableModel {

  public id: number;
  public label: string;
  public position: number;
  public format: string;
  public duration: number;
  public bitrate: number;
  public frequency: number;
  public channelmode: string;
  public contenttype: string;
  public layer: number;
  public statusMessage: string;

  public canceled: boolean;

  SETABLE = ['label', 'position', 'format', 'duration', 'bitrate', 'frequency'];

  VALIDATORS = {
    label: [REQUIRED(), LENGTH(1, 255)],
    self: [FILE_TEMPLATED()]
  };

  public template: HalDoc;

  constructor(audioVersion?: HalDoc, file?: HalDoc | Upload | string) {
    super();
    this.initUpload(audioVersion, file);
  }

  setTemplate(template: HalDoc) {
    this.template = template;
    if (template) {
      this.set('position', template['position']);
      this.set('label', template['label']);
      this.VALIDATORS['self'] = [FILE_TEMPLATED(template)];
    } else {
      this.VALIDATORS['self'] = [FILE_TEMPLATED()];
    }
  }

  stateComplete(status: string): boolean {
    return status === 'complete' || status === 'invalid';
  }

  stateError(status: string): string {
    if (this.status === 'not found') {
      return 'Unable to find file - please remove and try again';
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
    this.bitrate = this.doc['bitRate'];
    if (this.bitrate) { this.bitrate = this.bitrate * 1000; }
    this.frequency = parseFloat(this.doc['frequency']) || undefined;
    if (this.frequency) { this.frequency = this.frequency * 1000; }
    this.channelmode = this.doc['channelMode'];
    this.contenttype = this.doc['contentType'];
    this.layer = this.doc['layer'];
    this.statusMessage = this.doc['statusMessage'];
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
