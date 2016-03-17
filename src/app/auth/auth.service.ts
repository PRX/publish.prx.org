import {Injectable} from 'angular2/core';
import {ReplaySubject} from 'rxjs';

export interface PrxAuthUser {
  id: number;
  name: string;
}

@Injectable()
export class AuthService {
  public user: ReplaySubject<PrxAuthUser>;

  constructor() {
    this.user = new ReplaySubject(1);
  }

  public setToken(token: string): void {
    // TODO: temporary
    setTimeout(() => {
      if (token) {
        this.user.next(<PrxAuthUser>{
          id: 999,
          name: 'foobar'
        });
      }
      else {
        this.user.next(null);
      }
    }, 1000);
  }
}
