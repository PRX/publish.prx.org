import { Http, Headers, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs';
import * as TemplateParser from 'url-template';
import { HalRemoteCache } from './halremote.cache';
import { HalLink } from './hallink';

/**
 * Http layer for HAL requests
 */
export class HalRemote {

  constructor(
    private http: Http,
    private host: string,
    private token?: Observable<string>,
    private refreshToken?: () => Observable<string>
  ) {}

  expand(link: HalLink, params: {} = null): string {
    if (!link || !link.href) {
      return null;
    } else if (link.templated) {
      return TemplateParser.parse(this.host + link.href).expand(params || {});
    } else if (link.href.match(/^http(s)?:\/\//)) {
      return link.href;
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
        return HalRemoteCache.set(href, this.httpRequest('get', href));
      }
    } else {
      return Observable.throw(new Error('No link object specified!'));
    }
  }

  put(link: HalLink, params: {} = null, data: {}): Observable<{}> {
    let href = this.expand(link, params);
    let body = data ? JSON.stringify(data) : null;
    HalRemoteCache.del(href);
    return this.httpRequest('put', href, body);
  }

  post(link: HalLink, params: {} = null, data: {}): Observable<{}> {
    let href = this.expand(link, params);
    let body = data ? JSON.stringify(data) : null;
    HalRemoteCache.del(href);
    return this.httpRequest('post', href, body);
  }

  delete(link: HalLink, params: {} = null): Observable<{}> {
    let href = this.expand(link, params);
    HalRemoteCache.del(href);
    return this.httpRequest('delete', href);
  }

  private httpRequest(method: string, href: string, body?: string, allowRetry = true): Observable<Response> {
    return this.httpOptions(body ? true : false)
      .flatMap(opts => {
        if (method === 'put' || method === 'post') {
          return this.http[method](href, body, opts);
        } else {
          return this.http[method](href, opts);
        }
      })
      .catch(res => Observable.of(res)) // don't throw http errors
      .flatMap(res => {
        if (method === 'get' && res.status === 200) {
          return Observable.of(res.json());
        } else if (method === 'put' && res.status === 204) {
          return Observable.of(true);
        } else if (method === 'post' && res.status === 201) {
          return Observable.of(res.json());
        } else if (method === 'delete' && res.status === 204) {
          return Observable.of(true);
        } else if (res.status === 401 && allowRetry && this.refreshToken) {
          return this.refreshToken().flatMap(() => this.httpRequest(method, href, body, false));
        } else {
          return Observable.throw(new Error(`Got ${res.status} from ${method.toUpperCase()} ${href}`));
        }
      });
  }

  private httpOptions(hasContent = false): Observable<RequestOptionsArgs> {
    let headers = new Headers();
    headers.append('Accept', 'application/hal+json');
    if (hasContent) {
      headers.append('Content-Type', 'application/hal+json');
    }
    if (this.token) {
      return this.token.first().map(tokenString => {
        headers.append('Authorization', `Bearer ${tokenString}`);
        return {headers: headers};
      });
    } else {
      return Observable.of({headers: headers});
    }
  }

}
