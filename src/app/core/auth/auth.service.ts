import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class AuthService {

  token = new ReplaySubject<string>(1);
  refresh = new ReplaySubject<boolean>(1);

  setToken(authToken: string) {
    if (authToken) {
      this.token.next(authToken);
    } else {
      this.token.next(null);
    }
  }

  // refresh and wait for a new auth token
  refreshToken(): Observable<string> {
    this.refresh.next(true);
    return this.token.skip(1);
  }

}
