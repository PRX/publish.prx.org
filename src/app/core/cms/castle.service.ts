import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {Http} from '@angular/http';
import {HalDoc} from './haldoc';
import {HalObservable} from './halobservable';
import {HalRemote} from './halremote';
import {HalLink} from './hallink';
import {Env} from '../core.env';

@Injectable()
export class CastleService {

  private replayRoot: ReplaySubject<{}>;

  constructor(private http: Http) {
    this.replayRoot = new ReplaySubject<{}>(1);
    this.getCastleRoot();
  }

  get root(): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.replayRoot.flatMap((obj) => {
      return Observable.of(new HalDoc(obj, this.getRemote()));
    });
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

  protected getCastleRoot(): void {
    this.getRemote().get(<HalLink> {href: '/api/v1'}).subscribe(
      (obj) => {
        this.replayRoot.next(obj);
      },
      (err) => {
        this.replayRoot.error(err);
      }
    );
  }

  protected getRemote(): HalRemote {
    return new HalRemote(this.http, Env.CASTLE_HOST);
  }

}
