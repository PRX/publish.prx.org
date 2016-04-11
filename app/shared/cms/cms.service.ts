import {Injectable} from 'angular2/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Http} from 'angular2/http';
import {HalDoc, HalObservable} from './haldoc';
import {Env} from '../../../config/env';

@Injectable()
export class CmsService {

  public authToken: ReplaySubject<string>;
  private rootDoc: ReplaySubject<any>;

  constructor(private http: Http) {
    this.authToken = new ReplaySubject<string>(1);
    this.rootDoc = new ReplaySubject<any>(1);
    this.http.get(`${Env.CMS_HOST}/api/v1`).subscribe((res) => {
      if (res.status === 200) {
        this.rootDoc.next(res.json());
      } else {
        this.rootDoc.error(`Got ${res.status} from ${Env.CMS_HOST}/api/v1`);
      }
    });
  }

  set token(token: string) {
    this.authToken.next(token);
  }

  get root(): HalObservable<HalDoc> {
    return this.rootDoc.flatMap((doc) => {
      return this.authToken.flatMap((token) => {
        if (!token) {
          return Observable.throw(new Error(`Unauthorized`));
        } else {
          return <HalObservable<HalDoc>> Observable.of(new HalDoc(doc, this.http, Env.CMS_HOST, token));
        }
      });
    });
  }

  follow(rel: string, params: Object = {}): HalObservable<HalDoc> {
    return this.root.flatMap((rootDoc) => {
      return rootDoc.follow(rel, params);
    });
  }

}
