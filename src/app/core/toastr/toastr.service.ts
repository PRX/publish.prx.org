import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

export interface ToastrState {
  message: string;
  status: string; // 'info', 'success', 'error'
}

@Injectable()
export class ToastrService {

  public state: Observable<ToastrState>;
  private observer: Observer<ToastrState>;

  constructor() {
    this.state = Observable.create((observer: Observer<ToastrState>) => {
      this.observer = observer;
    });
  }

  show(options: any) {
    this.observer.next(<ToastrState> options);
  }

  info(message: string) {
    this.show({message, 'status': 'info'});
  }

  success(message: string) {
    this.show({message, 'status': 'success'});
  }

  error(message: string) {
    this.show({message, 'status': 'error'});
  }

}
