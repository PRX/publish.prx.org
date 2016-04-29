import {Subscription} from 'rxjs';
import {Upload} from '../services/upload.service';
import {HalDoc} from '../../shared/cms/haldoc';

export class AudioModel {

  static STAT_UPLOADING = ['uploading', 'upload failed', 'saving', 'save failed'];

  static STAT_PROCESSING = ['uploaded', 'validating', 'valid', 'invalid',
    'complete', 'creating mp3s', 'creating mp3s failed', 'mp3s created'];

  static STAT_DONE = ['done'];

  static STAT_ERROR = ['upload failed', 'save failed', 'invalid', 'creating mp3s failed'];

  // remote properties
  id: number;
  filename: string;
  label: string;
  size: number;
  duration: number;
  position: number;
  status: string;

  // state of the upload
  progress: number;
  progressSub: Subscription;

  // existing docs
  doc: HalDoc;

  // new uploads
  upload: Upload;
  version: HalDoc;

  constructor(data: any = {}) {
    let flds = ['id', 'filename', 'label', 'size', 'duration', 'position', 'status'];
    for (let key of Object.keys(data)) {
      if (flds.indexOf(key) > -1) {
        this[key] = data[key];
      }
    }
  }

  static fromDoc(doc: HalDoc): AudioModel {
    // TODO: smoke and mirrors
    doc['status'] = (doc['status'] === 'uploaded') ? 'done' : doc['status'];
    let audio = new AudioModel(doc);
    audio.doc = doc;
    // audio.startProcessing();
    return audio;
  }

  static fromUpload(upload: Upload, version: HalDoc): AudioModel {
    let audio = new AudioModel({
      filename: upload.name,
      size: upload.file.size
    });
    audio.upload = upload;
    audio.version = version;
    audio.startUpload();
    return audio;
  }

  get isError(): boolean {
    return AudioModel.STAT_ERROR.indexOf(this.status) > -1;
  }

  get isUploading(): boolean {
    return AudioModel.STAT_UPLOADING.indexOf(this.status) > -1;
  }

  get isProcessing(): boolean {
    return AudioModel.STAT_PROCESSING.indexOf(this.status) > -1;
  }

  get isDone(): boolean {
    return AudioModel.STAT_DONE.indexOf(this.status) > -1;
  }

  startUpload() {
    this.progress = 0;
    this.status = 'uploading';
    this.progressSub = this.upload.progress.subscribe(
      (pct: number) => { this.progress = pct; },
      (err: string) => { console.error(err); this.status = 'upload failed'; },
      () => { setTimeout(() => { this.startSaving(); }, 500); }
    );
  }

  startSaving() {
    this.status = 'saving';
    let data = {
      filename: this.filename,
      label: this.label,
      size: this.size,
      duration: this.duration,
      upload: this.upload.url()
    };
    this.version.create('prx:audio', {}, data).subscribe(
      (doc: HalDoc) => { this.doc = doc; this.startProcessing(); },
      (err: string) => { console.error(err); this.status = 'save failed'; }
    );
  }

  startProcessing() {
    this.progress = 0.1;
    this.status = 'processing';

    // TODO: smoke and mirrors
    setTimeout(() => { this.progress = 0.4; }, 2000);
    setTimeout(() => { this.progress = 1.0; }, 4000);
    setTimeout(() => { this.status = 'done'; }, 5000);
  }

  changePosition(newPosition: number) {
    this.doc.update({position: newPosition}).subscribe((doc) => {
      console.log(`moved ${this.filename} to position ${doc[`position`]}`);
      this.doc = doc;
      this.position = newPosition;
    });
  }

  destroy() {
    if (this.upload) {
      this.upload.cancel();
    }
    if (this.doc) {
      this.doc.destroy().subscribe(() => { /* no-op */ });
    }

    // TODO: for some reason, evaporate keeps caching these files, preventing
    // future uploads from working
    if (this.upload && window.localStorage && window.localStorage.getItem('awsUploads')) {
      let cache = JSON.parse(window.localStorage.getItem('awsUploads'));
      let encodedPath = encodeURIComponent(this.upload.path);
      for (let key of Object.keys(cache)) {
        if (encodedPath === cache[key].awsKey) {
          console.log(`TODO: deleting evaporate cache ${key}`);
          delete cache[key];
        }
      }
      window.localStorage.setItem('awsUploads', JSON.stringify(cache));
    }
  }

  unsubscribe() {
    if (this.progressSub) {
      this.progressSub.unsubscribe();
    }
  }

}
