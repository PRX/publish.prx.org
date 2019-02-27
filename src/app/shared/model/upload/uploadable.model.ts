
import {interval as observableInterval,  Observable ,  Subscription } from 'rxjs';

import {takeWhile, map, mergeMap} from 'rxjs/operators';




import { HalDoc, Upload } from '../../../core';
import { BaseModel } from 'ngx-prx-styleguide';
import { FALSEY } from '../invalid';

export abstract class UploadableModel extends BaseModel {

  public filename: string;
  public size: number;
  public status: string;
  public enclosureHref: string;
  public enclosureS3: string;

  // state indicators
  public isUploading: boolean;
  public isUploadError: string;
  public isProcessing: boolean;
  public isProcessError: string;
  public isProcessTimeout: boolean;
  public isCompleted: boolean;

  // in-progress or processing uploads
  public progress: number;
  public uuid: string;

  UPLOAD_SETABLE = ['filename', 'size', 'status', 'enclosureHref',
    'enclosureS3', 'uuid', 'isUploading', 'isUploadError', 'isDestroy'];

  UPLOAD_VALIDATORS = {
    isUploading:   [FALSEY('Wait for upload to complete')],
    isUploadError: [FALSEY('Resolve upload errors first')]
  };

  UPLOAD_PROCESS_INTERVAL = 2000;
  UPLOAD_PROCESS_ESTIMATE = 20000;
  UPLOAD_PROCESS_TIMEOUT = 60000;

  upload: Upload;
  private uploadSub: Subscription;
  private processSub: Subscription;

  abstract stateComplete(status: string): boolean;
  abstract stateError(status: string): string;

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
      this.set('filename', file.name);
      this.set('size', file.size);
      this.set('enclosureHref', file.url);
      this.set('enclosureS3', file.s3url);
      if (!file.complete) {
        this.watchUpload(file);
      }
    } else if (file instanceof HalDoc) {
      this.setState();
      if (this.isProcessing) {
        this.watchProcess();
      }
    }
  }

  watchUpload(upload: Upload, startFromBeginning = true) {
    this.upload = upload;
    if (startFromBeginning) {
      this.progress = 0;
      this.set('isUploading', true);
      this.set('isUploadError', null);
    }
    this.uploadSub = upload.progress.subscribe(
      (pct: number) => { this.progress = pct; },
      (err: string) => { console.error(err); this.set('isUploadError', err); },
      () => { setTimeout(() => { this.completeUpload(); }, 500); }
    );
  }

  setState() {
    this.isCompleted = this.stateComplete(this.status);
    this.isProcessError = this.stateError(this.status);
    if (this.isProcessTimeout) {
      this.isProcessError = 'Timed out waiting for processing';
    }
    this.isProcessing = !(this.isCompleted || this.isProcessError);
  }

  watchProcess() {
    let start = new Date().getTime();
    this.progress = 0;
    this.processSub = observableInterval(this.UPLOAD_PROCESS_INTERVAL).pipe(
      mergeMap(() => this.doc.reload()),
      map(doc => {
        let elapsed = new Date().getTime() - start;
        this.isProcessTimeout = elapsed > this.UPLOAD_PROCESS_TIMEOUT;
        this.init(this.parent, doc, false);
        this.setState();
        return Math.min(elapsed / this.UPLOAD_PROCESS_ESTIMATE, 0.9);
      }),
      takeWhile(() => this.isProcessing), )
      .subscribe(
        pct => this.progress = pct,
        err => console.error('err', err)
      );
  }

  retryUpload() {
    this.unsubscribe();
    if (this.upload) {
      this.upload.upload();
      this.watchUpload(this.upload, true);
    }
  }

  retryProcessing() {
    this.status = 'uploading';
    this.setState();
    this.doc.update({}).subscribe(() => this.watchProcess());
  }

  completeUpload() {
    this.set('isUploading', false);
    this.unsubscribe();
  }

  unsubscribe() {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
      this.uploadSub = null;
    }
    if (this.processSub) {
      this.processSub.unsubscribe();
      this.processSub = null;
    }
  }

  decode() {
    this.filename = this.doc['filename'];
    this.size = this.doc['size'];
    this.status = this.doc['status'];
    this.enclosureHref = this.doc.expand('enclosure');

    // localstored fields that will never go to the api
    this.enclosureS3 = '';
    this.uuid = '';
    this.isUploading = false;
    this.isUploadError = '';
    this.isDestroy = false;
  }

  encode(): {} {
    let data = {};
    if (this.isNew) {
      data['upload'] = this.enclosureS3;
      data['size'] = this.size; // preserve when saving
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
      this.set('isUploading', false);
      this.set('isUploadError', null);
      this.unstore();
    }
  }

}
