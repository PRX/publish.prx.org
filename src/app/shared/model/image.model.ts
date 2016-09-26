import { Observable } from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { UploadableModel } from './uploadable.model';

export class ImageModel extends UploadableModel {

  public id: number;
  public caption: string = '';
  public credit: string = '';

  SETABLE = ['caption', 'credit', 'isDestroy'];

  private series: HalDoc;

  constructor(series?: HalDoc, story?: HalDoc, file?: HalDoc | Upload | string) {
    super();
    this.series = series;
    this.initUpload(story, file);
  }

  key() {
    if (this.doc) {
      return `prx.image.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.image.new.${this.parent.id}`; // existing story
    } else if (this.series) {
      return `prx.image.new.series.${this.series.id}`; // new story in series
    } else {
      return `prx.image.new`; // new standalone story
    }
  }

  related() {
    return {};
  }

  decode() {
    super.decode();
    this.id = this.doc['id'];
    this.caption = this.doc['caption'] || '';
    this.credit = this.doc['credit'] || '';
  }

  encode(): {} {
    let data = super.encode();
    data['caption'] = this.caption;
    data['credit'] =  this.credit;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:images', {}, data);
  }

  watchUpload(upload: Upload, startFromBeginning = true) {
    this.set('isDestroy', false); // TODO: why?
    super.watchUpload(upload, startFromBeginning);
  }

  destroy() {
    this.set('isDestroy', true);
    super.destroy();
    if (this.isNew) {
      this.unstore();
    }
  }

}
