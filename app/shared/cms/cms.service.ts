import {Injectable} from 'angular2/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Http} from 'angular2/http';
import {HalDoc, HalObservable} from './haldoc';
import {HalRemote, HalLink} from './halremote';
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

  setToken(token: string) {
    this.replayToken.next(token);
  }

  get root(): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.replayRoot.flatMap((obj) => {
      return this.replayToken.flatMap((token) => {
        if (!token) {
          return Observable.throw(new Error(`Unauthorized`));
        } else {
          return Observable.of(new HalDoc(obj, this.getRemote(token)));
        }
      });
    });
  }

  get account(): HalObservable<HalDoc> {
    return this.follow('prx:authorization').follow('prx:default-account');
  }

  follow(rel: string, params: {} = null): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.root.flatMap((rootDoc) => {
      return rootDoc.follow(rel, params);
    });
  }

  followList(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return <HalObservable<HalDoc[]>> this.root.flatMap((rootDoc) => {
      return rootDoc.followList(rel, params);
    });
  }

  followItems(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return <HalObservable<HalDoc[]>> this.root.flatMap((rootDoc) => {
      return rootDoc.followItems(rel, params);
    });
  }

  protected getCmsRoot(): void {
    this.getRemote().get(<HalLink> {href: '/api/v1'}).subscribe(
      (obj) => { this.replayRoot.next(obj); },
      (err) => { this.replayRoot.error(err); }
    );
  }

  protected getRemote(token: string = null): HalRemote {
    return new HalRemote(this.http, Env.CMS_HOST, token);
  }

}
