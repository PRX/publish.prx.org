import {Injectable} from 'angular2/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Http} from 'angular2/http';
import {HalDoc, HalObservable} from './haldoc';
import {HalRemote} from './halremote';
import {Env} from '../../../config/env';

@Injectable()
export class CmsService {

  private replayToken: ReplaySubject<string>;
  private replayRoot: ReplaySubject<{}>;

  constructor(private http: Http) {
    this.replayToken = new ReplaySubject<string>(1);
    this.replayRoot = new ReplaySubject<{}>(1);
    this.getCmsRoot();
  }

  get token(): Observable<string> {
    return this.replayToken;
  }

  set token(token: string) {
    this.replayToken.next(token);
  }

  get root(): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.replayRoot.flatMap((obj) => {
      return this.replayToken.flatMap((token) => {
        if (!token) {
          return Observable.throw(new Error(`Unauthorized`));
        } else {
          let remote = new HalRemote(this.http, Env.CMS_HOST, token);
          return Observable.of(new HalDoc(obj, remote));
        }
      });
    });
  }

  follow(rel: string, params: Object = {}): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.root.flatMap((rootDoc) => {
      return rootDoc.follow(rel, params);
    });
  }

  private getCmsRoot(): void {
    let unauthRemote = new HalRemote(this.http, Env.CMS_HOST, null);
    unauthRemote.get({href: '/api/v1'}).subscribe((obj) => {
      this.replayRoot.next(obj);
    });
  }

}
