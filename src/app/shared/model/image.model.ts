import { Observable } from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { UploadableModel } from './uploadable.model';

export class ImageModel extends UploadableModel {

  public id: number;
  public filename: string;
  public caption: string = '';
  public credit: string = '';

  SETABLE = ['caption', 'credit', 'isDestroy'];

  private grandparent: HalDoc;

  constructor(grandparent: HalDoc, parent?: HalDoc, file?: HalDoc | Upload | string) {
    super();
    this.grandparent = grandparent;
    this.initUpload(parent, file);
  }

  key() {
    if (this.doc) {
      return `prx.image.${this.doc.profileSubtype}.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.image.new.${this.parent.profileType}.${this.parent.id}`;
    } else if (this.grandparent) {
      return `prx.image.draft.${this.grandparent.profileType}.${this.grandparent.id}`;
    } else {
      return `prx.image.new`;
    }
  }

  related() {
    return {};
  }

  decode() {
    super.decode();
    this.id = this.doc['id'];
    this.filename = this.doc['filename'];
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
    if (this.parent.has('prx:images')) {
      return this.parent.create('prx:images', {}, data);
    } else if (this.parent.has('prx:image', false)) {
      return this.parent.create('prx:image', {}, data);
    } else {
      return Observable.throw(new Error('Cannot find image link on this resource!'));
    }
  }

  watchUpload(upload: Upload, startFromBeginning = true) {
    this.set('isDestroy', false); // TODO: why?
    super.watchUpload(upload, startFromBeginning);
  }

}
