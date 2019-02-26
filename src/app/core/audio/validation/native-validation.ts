import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { ValidationMetadata, AudioValidation } from './validation';

export class NativeValidation implements AudioValidation {

  private fileName: string;
  private fileSrc: string;
  private element: HTMLAudioElement;
  private data: ValidationMetadata;
  private sub: Subscriber<ValidationMetadata>;

  constructor(src: File | string) {
    this.data = <ValidationMetadata> {};
    if (src instanceof File) {
      this.fileName = src.name;
      this.fileSrc = URL.createObjectURL(src);
      if (src.type) {
        // getting "mpeg" on valid mp3s
        this.data.format = src.type.split('/').pop();
      }
    } else {
      this.fileName = src.split('/').pop();
      this.fileSrc = src;
    }
  }

  validate(): Observable<ValidationMetadata> {
    return Observable.create(sub => {
      this.element = document.createElement('audio');
      this.element.addEventListener('canplaythrough', event => {
        this.data.duration = (event.currentTarget['duration'] || 0) * 1000;
        sub.next(this.data);
        sub.complete();
        this.cleanup();
      });
      this.element.addEventListener('error', event => {
        this.data.duration = 0;
        this.data.format = 'unknown';
        sub.next(this.data);
        sub.complete();
        this.cleanup();
      });
      this.element.src = this.fileSrc;
    });
  }

  private cleanup() {
    if (this.fileSrc) {
      URL.revokeObjectURL(this.fileSrc);
      this.fileSrc = null;
    }
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

}
