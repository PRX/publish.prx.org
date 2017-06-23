import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { ValidationMetadata, AudioValidation } from './validation';

export class AuroraValidation implements AudioValidation {

  private fileName: string;
  private asset: AV.Asset;
  private data: ValidationMetadata;
  private sub: Subscriber<ValidationMetadata>;

  constructor(src: File | string) {
    if (src instanceof File) {
      this.fileName = src.name;
      this.asset = AV.Asset.fromFile(src);
    } else {
      this.fileName = src.split('/').pop();
      this.asset = AV.Asset.fromURL(src);
    }
    this.data = <ValidationMetadata> {};
  }

  validate(): Observable<ValidationMetadata> {
    return Observable.create(sub => {
      this.sub = sub;
      this.asset.get('format', f => this.update());
      this.asset.get('duration', d => this.update());
      this.asset.get('metadata', m => this.update());
      this.asset.get('error', err => sub.error(err));
    });
  }

  private update() {
    if (this.asset.duration) {
      this.data.duration = this.asset.duration;
    }
    if (this.asset.format) {
      this.data.format = this.asset.format.formatID;
      // TODO: format doesn't actually include data, so this never works
      if (this.data.format === 'mp3' && this.asset.format.layer === 2) {
        this.data.format = 'mp2';
      }
      if (this.data.format === 'mp3' && this.fileName.match(/\.mp2$/)) {
        this.data.format = 'mp2'; // temporary hack
      }
      this.data.bitrate = this.asset.format.bitrate;
      this.data.frequency = this.asset.format.sampleRate;
    }

    // file MUST have format and duration - metadata is optional
    if (this.data.duration && this.data.format) {
      this.sub.next(this.data);
      this.sub.complete();
    }
  }

}
