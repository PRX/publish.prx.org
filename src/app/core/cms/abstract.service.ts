import { Observable, ReplaySubject } from 'rxjs';
import { Http } from '@angular/http';
import { HalDoc } from './haldoc';
import { HalObservable } from './halobservable';
import { HalRemote } from './halremote';

export abstract class AbstractService {
  protected replayToken: ReplaySubject<string>;
  protected replayRoot: ReplaySubject<{}>;
  protected refreshToken: () => Observable<string>;

  constructor(protected http: Http) {
    this.replayToken = new ReplaySubject<string>(1);
    this.replayRoot = new ReplaySubject<{}>(1);
    this.getRoot();
  }

  get token(): Observable<string> {
    return this.replayToken;
  }

  setToken(token: string, refreshToken?: any) {
    this.replayToken.next(token);
    this.refreshToken = refreshToken;
  }

  get root(): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.replayRoot.flatMap((obj) => {
      return this.replayToken.flatMap((token) => {
        if (!token) {
          return Observable.throw(new Error(`Unauthorized`));
        } else {
          return Observable.of(new HalDoc(obj, this.getRemote(true)));
        }
      });
    });
  }

  get auth(): HalObservable<HalDoc> {
    return this.follow('prx:authorization');
  }

  get account(): HalObservable<HalDoc> {
    return this.auth.follow('prx:default-account');
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

  protected abstract getRoot(): void

  protected abstract getRemote(useToken: boolean): HalRemote
}
