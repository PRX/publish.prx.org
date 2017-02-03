import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Observer } from 'rxjs';

export interface ModalState {
  hide: boolean;
  title: string;
  body: string;
  primaryButton: string;
  secondaryButton: string;
  buttonCallback: Function;
  height: number;
  width: number;
}

@Injectable()
export class ModalService {

  public state: Observable<ModalState>;
  private observer: Observer<ModalState>;

  constructor(private sanitizer: DomSanitizer) {
    this.state = Observable.create((observer: Observer<ModalState>) => {
      this.observer = observer;
    });
  }

  alert(title: string, body?: string, callback?: Function) {
    body = body ? `<p>${body}</p>` : undefined;
    if (callback) {
      this.emit({title: title, body: body, buttons: ['Okay'], buttonCallback: callback});
    } else {
      this.emit({title: title, body: body});
    }
  }

  confirm(title: string, message: string, callback: Function, primaryButtonLabel = 'Okay', secondaryButtonLabel = 'Cancel') {
    this.emit({
      title: title,
      body: message ? `<p>${message}</p>` : undefined,
      primaryButton: primaryButtonLabel,
      secondaryButton: secondaryButtonLabel,
      buttonCallback: (label: string) => {
        if (callback) { callback(label === primaryButtonLabel); }
      }
    });
  }

  show(options: any) {
    this.emit(<ModalState> options);
  }

  hide() {
    this.emit({hide: true});
  }

  private emit(data: {}) {
    data['hide'] = (data['hide'] === undefined) ? false : true;
    if (data['body']) {
      data['body'] = this.sanitizer.bypassSecurityTrustHtml(data['body']);
    }
    this.observer.next(<ModalState> data);
  }

}
