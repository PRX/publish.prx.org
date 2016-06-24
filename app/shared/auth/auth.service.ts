import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';

@Injectable()
export class AuthService {

  token = new ReplaySubject<string>(1);
  isAuthorized = new ReplaySubject<boolean>(1);

  setToken(authToken: string) {
    if (authToken) {
      this.token.next(authToken);
    } else {
      this.token.next(null);
    }
  }

}
