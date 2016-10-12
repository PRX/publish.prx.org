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

  stateComplete(status: string): boolean {
    return status === 'complete';
  }

  stateError(status: string): string {
    if (this.status === 'not found') {
      return 'Unable to find file - please remove and try again';
    } else if (this.status === 'invalid') {
      return 'Not a valid image file - please remove and try again';
    } else if (this.status === 'failed') {
      return 'Unable to process file - please remove and try again';
    }
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
    let create: Observable<HalDoc>;
    if (this.parent.has('prx:images')) {
      create = this.parent.create('prx:images', {}, data);
    } else if (this.parent.has('prx:image')) {
      create = this.parent.create('prx:image', {}, data);
    } else if (this.parent.has('prx:create-image')) {
      create = this.parent.create('prx:create-image', {}, data);
    } else {
      create = Observable.throw(new Error('Cannot find image link on this resource!'));
    }
    return create.map(doc => {
      this.setState();
      this.watchProcess();
      return doc;
    });
  }

}
