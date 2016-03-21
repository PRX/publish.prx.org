import {Http, Headers, RequestOptions, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

/*
 * Generic class for interacting with HAL api
 */
export class HalDoc {
  private _http: Http;
  private _host: string;
  private _token: string;

  constructor(data: any = {}, http: Http, host: string, authToken: string) {
    Object.keys(data).forEach((key) => { this[key] = data[key]; });
    this._http = http;
    this._host = host;
    this._token = authToken;
  }

  set token(token: string) {
    this._token = token;
  }

  follow(rel: string, params: any = {}): Observable<HalDoc> {
    let links = this.links(rel);
    if (links.length == 0) {
      return Observable.empty();
    }
    else if (links.length > 1) {
      return Observable.throw(new Error(`TODO - I can't deal with > 1 links in ${rel}`));
    }
    else if (!params && this.embedded(rel)) {
      return Observable.of(this.embedded(rel));
    }
    else if (links[0].templated) {
      return Observable.throw(new Error(`TODO - I can't deal with templated links in ${rel}`));
    }
    else {
      let path = links[0].href;
      let headers = new Headers();
      headers.append('Accept', 'application/json');
      if (this._token) {
        headers.append('Authorization', `Bearer ${this._token}`);
      }
      return this._http.get(this._host + path, {headers: headers}).map((res) => {
        return new HalDoc(res.json(), this._http, this._host, this._token);
      });
    }
  }

  follows(...rels: string[]): Observable<HalDoc> {
    if (rels.length) {
      return this.follow(rels.shift()).flatMap((doc) => {
        return doc.follows.apply(doc, rels);
      });
    }
    else {
      return Observable.of(this);
    }
  }

  links(rel: string): any[] {
    if (this['_links'] && this['_links'][rel]) {
      if (this['_links'][rel] instanceof Array) {
        return this['_links'][rel];
      }
      else {
        return [this['_links'][rel]];
      }
    }
    else {
      return [];
    }
  }

  link(rel: string, params: any = {}): string {
    let link = this.links(rel)[0];
    if (link) {
      if (link.templated) {
        throw new Error(`TODO - I can't deal with templated links in ${rel}`);
      }
      return this._host + <string>link.href;
    }
    else {
      return null;
    }
  }

  embedded(rel: string): HalDoc {
    if (this['_embedded'] && this['_embedded'][rel]) {
      return this['_embedded'][rel];
    }
    else {
      return null;
    }
  }

}
