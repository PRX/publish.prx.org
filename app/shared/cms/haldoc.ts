import {Observable} from 'rxjs/Observable';
import {HalRemote} from './halremote';

// Bring observables up to snuff
export interface HalObservable<T> extends Observable<T> {
  follow(rel: string): HalObservable<T>;
  followList(rel: string): HalObservable<T[]>;
  followItems(rel: string): HalObservable<T[]>;
}
Observable.prototype['follow'] = function(rel: string) {
  return this.flatMap((doc: HalDoc) => {
    return doc.follow(rel);
  });
};
Observable.prototype['followList'] = function(rel: string) {
  return this.flatMap((doc: HalDoc) => {
    return doc.followList(rel);
  });
};
Observable.prototype['followItems'] = function(rel: string) {
  return this.flatMap((doc: HalDoc) => {
    return doc.followItems(rel);
  });
};

/*
 * Generic class for interacting with HAL api
 */
export class HalDoc {

  constructor(data: any = {}, private remote: HalRemote) {
    Object.keys(data).forEach((key) => { this[key] = data[key]; });
  }

  save(data: any): HalObservable<HalDoc> {
    console.log('TODO put', data);
    return null;
  }

  create(rel: string, params: any = {}, data: any): HalObservable<HalDoc> {
    let link = this['_link'] ? this['_links'][rel] : null;
    if (!link) {
      let err = new Error(`Expected create link at _links.${rel} - got null`);
      console.error(err.message);
      throw err; // TODO: can't observable.throw because we used halobservable
    } else if (link instanceof Array) {
      let err = new Error(`Expected create link at _links.${rel} - got array`);
      console.error(err.message);
      throw err; // TODO: can't observable.throw because we used halobservable
    } else {
      return <HalObservable<HalDoc>> this.remote.post(link, params, data).map((obj) => {
        return new HalDoc(obj, this.remote);
      });
    }
  }

  delete(): HalObservable<HalDoc> {
    return null;
  }

  expand(rel: string, params: any = {}): string {
    let link = this['_links'] ? this['_links'][rel] : null;
    if (link && link instanceof Array) {
      link = link[0];
    }
    return this.remote.expand(link, params);
  }

  followLink(linkObj: any, params: any = {}): HalObservable<HalDoc> {
    return <HalObservable<HalDoc>> this.remote.get(linkObj, params).map((obj) => {
      return new HalDoc(obj, this.remote);
    });
  }

  follow(rel: string, params: {} = null): HalObservable<HalDoc> {
    if (!params && this['_embedded'] && this['_embedded'][rel]) {
      return <HalObservable<HalDoc>> this.embedOne(rel);
    } else if (this['_links'] && this['_links'][rel]) {
      return <HalObservable<HalDoc>> this.linkOne(rel, params);
    } else {
      return <HalObservable<HalDoc>> Observable.empty();
    }
  }

  followList(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    if (!params && this['_embedded'] && this['_embedded'][rel]) {
      return <HalObservable<HalDoc[]>> this.embedList(rel);
    } else if (this['_links'] && this['_links'][rel]) {
      return <HalObservable<HalDoc[]>> this.linkList(rel);
    } else {
      return <HalObservable<HalDoc[]>> Observable.empty();
    }
  }

  followItems(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return <HalObservable<HalDoc[]>> this.follow(rel, params).flatMap((doc) => {
      return doc.followList('prx:items');
    });
  }

  private embedOne(rel: string): Observable<HalDoc> {
    if (this['_embedded'][rel] instanceof Array) {
      let err = new Error(`Expected object at _embedded.${rel} - got list`);
      console.error(err.message);
      return Observable.throw(err);
    } else {
      return Observable.of(new HalDoc(this['_embedded'][rel], this.remote));
    }
  }

  private linkOne(rel: string, params: {} = null): Observable<HalDoc> {
    if (this['_links'][rel] instanceof Array) {
      let err = new Error(`Expected object at _links.${rel} - got list`);
      console.error(err.message);
      return Observable.throw(err);
    } else {
      return this.followLink(this['_links'][rel], params);
    }
  }

  private embedList(rel: string): Observable<HalDoc[]> {
    if (this['_embedded'][rel] instanceof Array) {
      return Observable.of(this['_embedded'][rel].map((data: any) => {
        return new HalDoc(data, this.remote);
      }));
    } else {
      let err = new Error(`Expected list at _embedded.${rel} - got object`);
      console.error(err.message);
      return Observable.throw(err);
    }
  }

  private linkList(rel: string, params: {} = null): Observable<HalDoc[]> {
    if (this['_links'][rel] instanceof Array) {
      return Observable.concat(this['_links'][rel].map((link: any) => {
        return this.followLink(this['_links'][rel], params);
      })).toArray();
    } else {
      let err = new Error(`Expected list at _links.${rel} - got object`);
      console.error(err.message);
      return Observable.throw(err);
    }
  }

}
