import {Http, Headers, RequestOptions, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import TemplateParser from 'url-template';

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

  followLink(linkObj: any, params: any = {}): Observable<HalDoc> {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
    }
    let href = this.host + linkObj.href;
    if (linkObj.templated) {
      href = TemplateParser.parse(href).expand(params);
    }
    return this.http.get(href, {headers: headers}).map((res) => {
      return new HalDoc(res.json(), this.http, this.host, this.token);
    });
  }

  follow(rel: string, params: any = {}): Observable<HalDoc> {
    let links = this.links(rel), embeds = this.embeds(rel);
    if (embeds) {
      return Observable.fromArray(embeds);
    }
    else if (links) {
      let allLinks = links.map((link) => {
        return this.followLink(link, params);
      });
      return Observable.concat.apply(this, allLinks);
    }
    else {
      return <Observable<HalDoc>>Observable.empty();
    }
  }

  follows(...rels: string[]): Observable<HalDoc> {
    if (rels.length) {
      return this.follow(rels.shift()).flatMap((doc) => {
        return <Observable<HalDoc>>doc.follows.apply(doc, rels);
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
    if (link && link.templated) {
      return TemplateParser.parse(this.host + link.href).expand(params);
    }
    else if (link) {
      return this.host + link.href;
    }
    else {
      return null;
    }
  }

  embeds(rel: string): HalDoc[] {
    if (this['_embedded'] && this['_embedded'][rel]) {
      let rawEmbeds: any = [];
      if (this['_embedded'][rel] instanceof Array) {
        rawEmbeds = this['_embedded'][rel];
      }
      else {
        rawEmbeds.push(this['_embedded'][rel]);
      }
      return rawEmbeds.map((data: any) => {
        return new HalDoc(data, this.http, this.host, this.token);
      });
    }
    else {
      return null;
    }
  }

}
