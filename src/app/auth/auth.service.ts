import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

export interface PrxAuthUser {
  id: number;
  name: string;
}

@Injectable()
export class AuthService {
  public user: Observable<PrxAuthUser>;

  constructor() {
    this.user = Observable.create(/* hmmm.... */);
  }

  public setToken(token: string): void {
    if (token) {
      // TODO: hal-get user info and user.onNext() it
    }
    else {
      // TODO: not logged in, so user.onNext(null)
    }
  }
}
