import {Injectable} from 'angular2/core';
import {Observable, Observer} from 'rxjs';

export interface ModalState {
  hide: boolean;
  title: string;
  body: string;
  buttons: string[];
  buttonCallback: Function;
}

@Injectable()
export class ModalService {

  public state: Observable<ModalState>;
  private observer: Observer<ModalState>;

  constructor() {
    this.state = Observable.create((observer: Observer<ModalState>) => {
      this.observer = observer;
    });
  }

  alert(title: string, body?: string) {
    this.emit({title: title, body: body});
  }

  prompt(title: string, message: string, callback: Function) {
    this.emit({
      title: title,
      body: message,
      buttons: ['Okay', 'Cancel'],
      buttonCallback: (label: string) => {
        if (callback) { callback(label === 'Okay'); }
      }
    });
  }

  hide() {
    this.emit({hide: true});
  }

  private emit(data: {}) {
    data['hide'] = (data['hide'] === undefined) ? false : true;
    this.observer.next(<ModalState> data);
  }

}
