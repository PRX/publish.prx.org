import {Observable, Subscription} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseModel} from '../../shared/model/base.model';
import {FALSEY} from '../../shared/model/base.invalid';
import {Upload} from '../../upload/services/upload.service';

export class AudioFileModel extends BaseModel {

  public id: number;
  public filename: string;
  public label: string;
  public size: number;
  public duration: number;
  public position: number;
  public status: string;
  public enclosureHref: string;

  // state indicators
  public isUploading: boolean;
  public isError: string;

  // in-progress uploads
  public progress: number;
  public uuid: string;

  SETABLE = ['filename', 'label', 'size', 'duration', 'position', 'enclosureHref',
    'uuid', 'isUploading', 'isError', 'isDestroy'];

  VALIDATORS = {
    isUploading: [FALSEY('Wait for upload to complete')],
    isError:     [FALSEY('Resolve upload errors first')]
  };

  private version: HalDoc;
  private upload: Upload;
  private progressSub: Subscription;

  constructor(audioVersion: HalDoc, file: HalDoc | Upload | string) {
    super();
    this.version = audioVersion;

    // initialize (loading new uploads by uuid)
    if (typeof file === 'string') {
      this.uuid = file;
    } else if (file instanceof Upload) {
      this.uuid = file.uuid;
    }
    this.init(file instanceof HalDoc ? file : null);

    // local-store info on new uploads
    if (file instanceof Upload) {
      this.set('filename', file.name);
      this.set('size', file.size);
      this.set('enclosureHref', file.url);
      if (!file.complete) {
        this.watchUpload(file);
      }
    }
  }

  key(doc: HalDoc) {
    if (doc) {
      return `prx.audio-file.${doc['id']}`;
    } else if (this.uuid) {
      return `prx.audio-file.${this.uuid}`;
    } else {
      return `prx.audio-file.new`;
    }
  }

  related(doc: HalDoc) {
    return {};
  }

  decode(doc: HalDoc) {
    this.id = doc['id'];
    this.filename = doc['filename'];
    this.label = doc['label'];
    this.size = doc['size'];
    this.duration = doc['duration'];
    this.position = doc['position'];
    this.status = doc['status'];
    this.enclosureHref = doc.expand('enclosure');
  }

  encode(): {} {
    return {
      filename: this.filename,
      label: this.label,
      size: this.size,
      duration: this.duration,
      position: this.position,
      upload: this.enclosureHref
    };
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.version.create('prx:audio', {}, data);
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
