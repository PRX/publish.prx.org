import {Injectable} from 'angular2/core';
import {Http, Headers, RequestOptions, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

const API_HOST = 'https://cms.prx.org';

export class HalDoc {
  private _http: Http;
  private _token: string;

  constructor(data: any = {}, http: Http, authToken: string) {
    Object.keys(data).forEach((key) => { this[key] = data[key]; });
    this._http = http;
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
      return this._http.get(API_HOST + path, {headers: headers}).map((res) => {
        return new HalDoc(res.json(), this._http, this._token);
      });
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
      console.log("GOT LINK _> ", link.href);
      return API_HOST + <string>link.href;
    }
    else {
      console.log(`no link "rel"`, this);
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

@Injectable()
export class PrxApiService {
  private _token: string;
  private _root: HalDoc;
  private _rootObservable: Observable<HalDoc>;

  constructor(private http: Http) {
    this._rootObservable = this.http.get(`${API_HOST}/api/v1`).map((res) => {
      this._root = new HalDoc(res.json(), this.http, this._token);
      return this._root;
    });
  }

  get root(): Observable<HalDoc> {
    return this._rootObservable;
  }

  set token(token: string) {
    this._token = token;
    if (this._root) {
      this._root.token = token;
    }
  }

  follow(rel: string, params: any = {}): Observable<HalDoc> {
    return this.root.flatMap((rootDoc) => {
      return rootDoc.follow(rel, params);
    });
  }

}
