import {Injectable} from 'angular2/core';
import {ReplaySubject} from 'rxjs';
import {PrxApiService, HalDoc} from '../shared/api/prx-api.service';

@Injectable()
export class AuthService {
  public user: ReplaySubject<HalDoc>;

  constructor(private apiService: PrxApiService) {
    this.user = new ReplaySubject(1);
  }

  public setToken(token: string): void {
    this.apiService.token = token;
    if (token) {
      this.apiService.follow('prx:authorization').subscribe((doc) => {
        doc.follow('prx:default-account').subscribe((accountDoc) => {
          this.user.next(accountDoc);
        });
      });
    }
    else {
      this.user.next(null);
    }
  }
}
