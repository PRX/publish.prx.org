import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs';
import {Http} from 'angular2/http';
import {HalDoc} from './haldoc';
import {Env} from '../../../config/env';

@Injectable()
export class CmsService {

  public authToken: ReplaySubject<string>;
  private rootDoc: ReplaySubject<any>;

  constructor(private http: Http) {
    this.authToken = new ReplaySubject<string>(1);
    this.rootDoc = new ReplaySubject(1);
    this.http.get(`${Env.CMS_HOST}/api/v1`).subscribe((res) => {
      this.rootDoc.next(res.json());
    });
  }

  set token(token: string) {
    this.authToken.next(token);
  }

  get root(): Observable<HalDoc> {
    return this.rootDoc.flatMap((doc) => {
      return this.authToken.flatMap((token) => {
        if (doc && token) {
          return Observable.of(new HalDoc(doc, this.http, Env.CMS_HOST, token));
        }
        else if (!doc) {
          return Observable.throw(new Error(`Unable to get root doc from ${Env.CMS_HOST}`));
        }
        else {
          return Observable.throw(new Error(`Unauthorized`));
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
      return <Observable<HalDoc>>rootDoc.follows.apply(rootDoc, rels);
    });
  }

}
