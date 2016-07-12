import {Observable, Subscription} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseModel} from '../../shared/model/base.model';
import {FALSEY} from '../../shared/model/base.invalid';
import {Upload} from '../../upload/services/upload.service';

export class ImageModel extends BaseModel {

  public id: number;
  public filename: string;
  public size: number;
  public caption: string = '';
  public credit: string = '';
  public enclosureHref: string;
  public enclosureS3: string;

  // state indicators
  public isUploading: boolean;
  public isError: string;

  // in-progress uploads
  public progress: number;
  public uuid: string;

  SETABLE = ['filename', 'size', 'caption', 'credit', 'enclosureHref',
    'enclosureS3', 'uuid', 'isUploading', 'isError', 'isDestroy'];

  VALIDATORS = {
    isUploading: [FALSEY('Wait for upload to complete')],
    isError:     [FALSEY('Resolve upload errors first')]
  };

  private series: HalDoc;
  private upload: Upload;
  private progressSub: Subscription;

  constructor(series?: HalDoc, story?: HalDoc, file?: HalDoc | Upload | string) {
    super();
    this.series = series;

    // initialize (loading new uploads by uuid)
    if (typeof file === 'string') {
      this.uuid = file;
    } else if (file instanceof Upload) {
      this.uuid = file.uuid;
    }
    this.init(story, file instanceof HalDoc ? file : null);

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
    this.id = this.doc['id'];
    this.filename = this.doc['filename'];
    this.size = this.doc['size'];
    this.caption = this.doc['caption'] || '';
    this.credit = this.doc['credit'] || '';
    this.enclosureHref = this.doc.expand('enclosure');
  }

  encode(): {} {
    let data = {caption: this.caption, credit: this.credit};
    if (this.isNew) {
      data['filename'] = this.filename;
      data['size'] = this.size;
      data['upload'] = `http:${this.enclosureHref}`;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:images', {}, data);
  }

  watchUpload(upload: Upload, startFromBeginning = true) {
    this.set('isDestroy', false);
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

  unsubscribe() {
    if (this.progressSub) {
      this.progressSub.unsubscribe();
      this.progressSub = null;
    }
  }

}
