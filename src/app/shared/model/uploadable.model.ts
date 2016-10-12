import { Subscription } from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from './base.model';
import { FALSEY } from './base.invalid';

export abstract class UploadableModel extends BaseModel {

  public filename: string;
  public size: number;
  public enclosureHref: string;
  public enclosureS3: string;

  // state indicators
  public isUploading: boolean;
  public isError: string;

  // in-progress uploads
  public progress: number;
  public uuid: string;

  UPLOAD_SETABLE = ['filename', 'size', 'enclosureHref', 'enclosureS3', 'uuid',
    'isUploading', 'isError'];

  UPLOAD_VALIDATORS = {
    isUploading: [FALSEY('Wait for upload to complete')],
    isError:     [FALSEY('Resolve upload errors first')]
  };

  private upload: Upload;
  private progressSub: Subscription;

  initUpload(parent?: HalDoc, file?: HalDoc | Upload | string) {
    this.SETABLE = Array.from(new Set(this.SETABLE.concat(this.UPLOAD_SETABLE)));
    for (let key of Object.keys(this.UPLOAD_VALIDATORS)) {
      this.VALIDATORS[key] = this.UPLOAD_VALIDATORS[key];
    }

    // initialize (loading new uploads by uuid)
    if (typeof file === 'string') {
      this.uuid = file;
    } else if (file instanceof Upload) {
      this.uuid = file.uuid;
    } else {
      this.uuid = null;
    }
    this.init(parent, file instanceof HalDoc ? file : null);

    // local-store info on new uploads
    if (file instanceof Upload) {
      this.setUpload(file);
    }
  }

  setUpload(file: Upload) {
    this.set('filename', file.name);
    this.set('size', file.size);
    this.set('enclosureHref', file.url);
    this.set('enclosureS3', file.s3url);
    if (!file.complete) {
      this.watchUpload(file);
    }
  }

  watchUpload(upload: Upload, startFromBeginning = true) {
    this.upload = upload;
    if (startFromBeginning) {
      this.progress = 0;
      this.set('isUploading', true);
      this.set('isError', null);
    }
    this.progressSub = upload.progress.subscribe(
      (pct: number) => { this.progress = pct; },
      (err: string) => { console.error(err); this.set('isError', err); },
      () => { setTimeout(() => { this.completeUpload(); }, 500); }
    );
  }

  retryUpload() {
    this.unsubscribe();
    if (this.upload) {
      this.upload.upload();
      this.watchUpload(this.upload, true);
    }
  }

  completeUpload() {
    this.set('isUploading', false);
    this.unsubscribe();
  }

  unsubscribe() {
    if (this.progressSub) {
      this.progressSub.unsubscribe();
      this.progressSub = null;
    }
  }

  decode() {
    this.filename = this.doc['filename'];
    this.size = this.doc['size'];
    this.enclosureHref = this.doc.expand('enclosure');
  }

  encode(): {} {
    let data = {};
    if (this.isNew) {
      // TODO: will the server calculate this for us?
      // data['filename'] = this.filename;
      // data['size'] = this.size;
      data['upload'] = this.enclosureS3;
    }
    return data;
  }

  destroy() {
    this.set('isDestroy', true);
    this.unsubscribe();
    if (this.upload) {
      this.upload.cancel();
    }
    if (this.isNew) {
      this.unstore();
    }
  }

}
