import {Upload} from '../services/upload.service';
import {HalDoc} from '../../shared/cms/haldoc';

export class AudioModel {

  // remote properties
  id: number;
  filename: string;
  label: string;
  size: number;
  duration: number;

  // state of the upload
  status: string;

  // local only
  error: string;
  progress: number;

  // existing docs
  doc: HalDoc;

  // new uploads
  upload: Upload;
  version: HalDoc;
  story: HalDoc;

  constructor(data: any = {}) {
    for (let key of Object.keys(data)) {
      if (['id', 'filename', 'label', 'size', 'duration'].indexOf(key) > -1) {
        this[key] = data[key];
      }
    }
  }

  static fromDoc(doc: HalDoc): AudioModel {
    let audio = new AudioModel(doc);
    audio.doc = doc;
    audio.startProcessing();
    return audio;
  }

  static fromUpload(upload: Upload, version: HalDoc, story: HalDoc): AudioModel {
    let audio = new AudioModel({
      filename: upload.name,
      size: upload.file.size
    });
    audio.upload = upload;
    audio.version = version;
    audio.story = story;
    audio.startUpload();
    return audio;
  }

  isStatus(status: string): boolean {
    if (this.status && status) {
      return this.status.toLowerCase() === status.toLowerCase();
    } else {
      return false;
    }
  }

  startUpload() {
    this.progress = 0;
    this.status = 'Uploading';
    this.error = null;
    this.upload.progress.subscribe(
      (pct: number) => { this.progress = pct; },
      (err: string) => { console.error(err); this.error = err; },
      () => { setTimeout(() => { this.startSaving(); }, 500); }
    );
  }

  startSaving() {
    this.progress = 0;
    this.status = 'Saving';
    this.error = null;
    let data = {
      filename: this.filename,
      label: this.label,
      size: this.size,
      duration: this.duration,
      upload: this.upload.url(),
      set_account_uri: this.story.expand('prx:account')
    };
    this.version.create('prx:audio', {}, data).subscribe(
      (doc: HalDoc) => { this.doc = doc; this.startProcessing(); },
      (err: string) => { console.error(err); this.error = err; }
    );
  }

  startProcessing() {
    this.progress = 0.1;
    this.status = 'Processing';
    this.error = null;
    setTimeout(() => { this.progress = 0.4; }, 1000);
  }

}
