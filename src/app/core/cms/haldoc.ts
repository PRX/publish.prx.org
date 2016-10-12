import { Observable } from 'rxjs/Observable';
import { HalRemote } from './halremote';
import { HalObservable } from './halobservable';

/*
 * Generic class for interacting with HAL api
 */
export class HalDoc {

  id: number;

  constructor(data: any = {}, protected remote: HalRemote) {
    this.setData(data);
  }

  get profileType() {
    let profile = this.expand('profile') || '';
    let match = profile.match(/\/model\/(collection\/)?([^\/]+)/);
    return match ? match.pop() : null;
  }

  get profileSubtype() {
    let profile = this.expand('profile') || '';
    let match = profile.match(/\/model\/(collection\/)?[^/]+\/(.+)$/);
    return match ? match.pop() : null;
  }

  reload(): HalObservable<HalDoc> {
    let link = this['_links'] ? this['_links']['self'] : null;
    if (!link) {
      return <HalObservable<HalDoc>> this.error(`Expected reload link at _links.self - got null`);
    } else if (link instanceof Array) {
      return <HalObservable<HalDoc>> this.error(`Expected reload link at _links.self - got array`);
    } else {
      return <HalObservable<HalDoc>> this.remote.get(link).map((obj) => {
        this.setData(obj);
        return <HalDoc> this;
      });
    }
  }

  update(data: any): HalObservable<HalDoc> {
    let link = this['_links'] ? this['_links']['self'] : null;
    if (!link) {
      return <HalObservable<HalDoc>> this.error(`Expected update link at _links.self - got null`);
    } else if (link instanceof Array) {
      return <HalObservable<HalDoc>> this.error(`Expected update link at _links.self - got array`);
    } else {
      return <HalObservable<HalDoc>> this.remote.put(link, null, data).map(() => {
        this.setData(data);
        return <HalDoc> this;
      });
    }
  }

  create(rel: string, params: any = {}, data: any): HalObservable<HalDoc> {
    let link = this['_links'] ? this['_links'][rel] : null;
    if (!link) {
      return <HalObservable<HalDoc>> this.error(`Expected create link at _links.${rel} - got null`);
    } else if (link instanceof Array) {
      return <HalObservable<HalDoc>>
        this.error(`Expected create link at _links.${rel} - got array`);
    } else {
      return <HalObservable<HalDoc>> this.remote.post(link, params, data).map((obj) => {
        return new HalDoc(obj, this.remote);
      });
    }
  }

  destroy(): HalObservable<HalDoc> {
    let link = this['_links'] ? this['_links']['self'] : null;
    if (!link) {
      return <HalObservable<HalDoc>> this.error(`Expected destroy link at _links.self - got null`);
    } else if (link instanceof Array) {
      return <HalObservable<HalDoc>> this.error(`Expected destroy link at _links.self - got array`);
    } else {
      return <HalObservable<HalDoc>> this.remote.delete(link).map(() => {
        return <HalDoc> this;
      });
    }
  }

  expand(rel: string, params: any = {}): string {
    let link = this['_links'] ? this['_links'][rel] : null;
    if (link && link instanceof Array) {
      link = link[0];
    }
    return this.remote.expand(link, params);
  }

  count(rel?: string): number {
    if (rel && this['_links'] && this['_links'][rel]) {
      let link = this['_links'][rel];
      if (link instanceof Array) {
        link = link[0];
      }
      if (link['count'] !== undefined) {
        return link['count'];
      }
    } else if (!rel && this['_count'] !== undefined) {
      return this['_count'];
    }
  }

  total(): number {
    if (this['_total'] !== undefined) {
      return this['_total'];
    }
  }

  has(rel: string, strict = true): boolean {
    if (this['_embedded'] && this['_embedded'][rel]) {
      return true;
    } else if (this['_links'] && this['_links'][rel]) {
      // TODO: temporary hack for has-one images
      if (strict && rel.match('image')) {
        return this['_links'][rel]['title'] !== null ? true : false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  isa(type: string, includeCollections = true): boolean {
    let profile = this.expand('profile') || '';
    if (profile.match(`model/${type}`)) {
      return true;
    } else if (includeCollections && profile.match(`model/collection/${type}`)) {
      return true;
    } else {
      return false;
    }
  }

  followLink(linkObj: any, params: any = {}): HalObservable<HalDoc> {
    let result: Observable<{}>;
    if (params && params['method'] === 'post') {
      result = this.remote.post(linkObj, params, null);
    } else if (params && params['method'] === 'put') {
      result = this.remote.put(linkObj, params, null);
    } else {
      result = this.remote.get(linkObj, params);
    }
    return <HalObservable<HalDoc>> result.map(obj => { return new HalDoc(obj, this.remote); });
  }

  follow(rel: string, params: {} = null): HalObservable<HalDoc> {
    if (!params && this['_embedded'] && this['_embedded'][rel]) {
      return <HalObservable<HalDoc>> this.embedOne(rel);
    } else if (this['_links'] && this['_links'][rel]) {
      return <HalObservable<HalDoc>> this.linkOne(rel, params);
    } else {
      return <HalObservable<HalDoc>> this.error(`Unable to find rel ${rel}`);
    }
  }

  followList(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    if (!params && this['_embedded'] && this['_embedded'][rel]) {
      return <HalObservable<HalDoc[]>> this.embedList(rel);
    } else if (this['_links'] && this['_links'][rel]) {
      return <HalObservable<HalDoc[]>> this.linkList(rel);
    } else {
      return <HalObservable<HalDoc[]>> this.error(`Unable to find rel ${rel}`);
    }
  }

  followItems(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return <HalObservable<HalDoc[]>> this.follow(rel, params).flatMap((doc) => {
      return doc.followList('prx:items').map((items) => {
        for (let item of items) {
          item['_count'] = doc['count'];
          item['_total'] = doc['total'];
        }
        return items;
      });
    });
  }

  protected error(msg: string): Observable<any> {
    console.error(msg);
    return Observable.throw(new Error(msg));
  }

  private embedOne(rel: string): Observable<HalDoc> {
    if (this['_embedded'][rel] instanceof Array) {
      return this.error(`Expected object at _embedded.${rel} - got list`);
    } else {
      return Observable.of(new HalDoc(this['_embedded'][rel], this.remote));
    }
  }

  private linkOne(rel: string, params: {} = null): Observable<HalDoc> {
    if (this['_links'][rel] instanceof Array) {
      let guessed = this.guessLink(this['_links'][rel], params);
      if (guessed) {
        return this.followLink(guessed, params);
      } else {
        return this.error(`Expected object at _links.${rel} - got list`);
      }
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
      return this.error(`Expected array at _embedded.${rel} - got object`);
    }
  }

  private linkList(rel: string, params: {} = null): Observable<HalDoc[]> {
    if (this['_links'][rel] instanceof Array) {
      let links: HalObservable<HalDoc>[] = this['_links'][rel].map((link: any) => {
        return this.followLink(link, params);
      });
      return Observable.from(links).concatAll().toArray();
    } else {
      return this.error(`Expected array at _links.${rel} - got object`);
    }
  }

  private setData(data: {}) {
    Object.keys(data).forEach((key) => {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    });
  }

  private guessLink(links: any[], params: {} = null): any {
    let lookingForFetch = params && params['id'] !== undefined;
    for (let link of links) {
      if (lookingForFetch && link.href.match(/\/\{id\}/)) {
        return link;
      } else if (!lookingForFetch && link.href.match(/\{.*page/)) {
        return link;
      }
    }
    return null;
  }

}
