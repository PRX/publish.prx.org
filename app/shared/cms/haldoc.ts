import {Http, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import TemplateParser from 'url-template';

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
  private http: Http;
  private host: string;
  private token: string;

  constructor(data: any = {}, http: Http, host: string, authToken: string) {
    Object.keys(data).forEach((key) => { this[key] = data[key]; });
    this.http = http;
    this.host = host;
    this.token = authToken;
  }

  link(rel: string, params: any = {}): string {
    let link = this['_links'] ? this['_links'][rel] : null;
    if (link && link instanceof Array) {
      link = link[0];
    }
    if (link && link.templated) {
      return TemplateParser.parse(this.host + link.href).expand(params || {});
    } else if (link) {
      return this.host + link.href;
    } else {
      return null;
    }
  }

  followLink(linkObj: any, params: any = {}): HalObservable<HalDoc> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
    }
    let href = this.host + linkObj.href;
    if (linkObj.templated) {
      href = TemplateParser.parse(href).expand(params || {});
    }
    return <HalObservable<HalDoc>> this.http.get(href, {headers: headers}).map((res) => {
      return new HalDoc(res.json(), this.http, this.host, this.token);
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
      return Observable.of(new HalDoc(this['_embedded'][rel], this.http, this.host, this.token));
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
        return new HalDoc(data, this.http, this.host, this.token);
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
