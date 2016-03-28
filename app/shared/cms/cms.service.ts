import {Injectable} from 'angular2/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Http} from 'angular2/http';
import {HalDoc} from './haldoc';
import {Env} from '../../../util/env';

@Injectable()
export class CmsService {

  public authToken: ReplaySubject<string>;
  private rootDoc: ReplaySubject<any>;

  constructor(private http: Http, token?: string) {
    this.authToken = new ReplaySubject<string>(1);
    this.rootDoc = new ReplaySubject<any>(1);
    this.http.get(`${Env.CMS_HOST}/api/v1`).subscribe((res) => {
      if (res.status === 200) {
        this.rootDoc.next(res.json());
      } else {
        this.rootDoc.error(`Got ${res.status} from ${Env.CMS_HOST}/api/v1`);
      }
    });
    if (token) {
      this.token = token;
    }
  }

  set token(token: string) {
    this.authToken.next(token);
  }

  get root(): Observable<HalDoc> {
    return this.rootDoc.flatMap((doc) => {
      return this.authToken.flatMap((token) => {
        if (!token) {
          return Observable.throw(new Error(`Unauthorized`));
        } else {
          return Observable.of(new HalDoc(doc, this.http, Env.CMS_HOST, token));
        }
      });
    });
  }

  follow(rel: string, params: Object = {}): Observable<HalDoc> {
    return this.root.flatMap((rootDoc) => {
      return rootDoc.follow(rel, params);
    });
  }

  follows(...rels: string[]): Observable<HalDoc> {
    return this.root.flatMap((rootDoc) => {
      return <Observable<HalDoc>> rootDoc.follows.apply(rootDoc, rels);
    });
  }

}
