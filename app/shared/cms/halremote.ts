import {Http, Headers, RequestOptionsArgs} from 'angular2/http';
import {Observable} from 'rxjs';
import TemplateParser from 'url-template';
import {HalRemoteCache} from './halremote.cache';

export interface HalLink {
  title: string ;
  name: string;
  profile: string;
  href: string;
  templated: boolean;
}

/**
 * Http layer for HAL requests
 */
export class HalRemote {

  constructor(
    private http: Http,
    private host: string,
    private token: string
  ) {}

  expand(link: HalLink, params: {} = null): string {
    if (!link || !link.href) {
      return null;
    } else if (link.templated) {
      return TemplateParser.parse(this.host + link.href).expand(params || {});
    } else {
      return this.host + link.href;
    }
  }

  get(link: HalLink, params: {} = null): Observable<{}> {
    let href = this.expand(link, params);
    if (href) {
      let cachedResponse = HalRemoteCache.get(href);
      if (cachedResponse) {
        return cachedResponse;
      } else {
        return HalRemoteCache.set(href, this.http.get(href, this.httpOptions()).flatMap((res) => {
          if (res.status === 200) {
            return Observable.of(res.json());
          } else {
            return Observable.throw(new Error(`Got ${res.status} from GET ${href}`));
          }
        }));
      }
    } else {
      return Observable.throw(new Error('No link object specified!'));
    }
  }

  put(link: HalLink, params: {} = null, data: {}): Observable<{}> {
    let href = this.expand(link, params);
    let body = JSON.stringify(data);
    HalRemoteCache.del(href);
    return this.http.put(href, body, this.httpOptions(true)).map((res) => {
      if (res.status === 204) {
        return Observable.of(true);
      } else {
        return Observable.throw(new Error(`Got ${res.status} from PUT ${href}`));
      }
    });
  }

  post(link: HalLink, params: {} = null, data: {}): Observable<{}> {
    let href = this.expand(link, params);
    let body = JSON.stringify(data);
    return this.http.post(href, body, this.httpOptions(true)).map((res) => {
      return res.json();
    });
  }

  delete(link: HalLink, params: {} = null): Observable<{}> {
    let href = this.expand(link, params);
    HalRemoteCache.del(href);
    return this.http.delete(href, this.httpOptions()).map((res) => {
      if (res.status === 204) {
        return Observable.of(true);
      } else {
        return Observable.throw(new Error(`Got ${res.status} from DELETE ${href}`));
      }
    });
  }

  private httpOptions(hasContent = false): RequestOptionsArgs {
    let headers = new Headers();
    headers.append('Accept', 'application/hal+json');
    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
    }
    if (hasContent) {
      headers.append('Content-Type', 'application/hal+json');
    }
    return {headers: headers};
  }

}
