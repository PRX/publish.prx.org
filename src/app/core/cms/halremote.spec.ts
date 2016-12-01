import { Http, Response, ResponseOptions, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable, ReplaySubject } from 'rxjs';
import { HalRemote } from './halremote';
import { HalRemoteCache } from './halremote.cache';
import { HalLink } from './hallink';

describe('HalRemote', () => {

  const mockHttp = new Http(new MockBackend(), new RequestOptions());
  const mockResponse = (data = {}, status = 200) => {
    return new Response(new ResponseOptions({body: JSON.stringify(data), status}));
  };

  let remote: HalRemote, link: HalLink, token: ReplaySubject<string>;
  beforeEach(() => {
    link = <HalLink> {href: '/foobar'};
    token = new ReplaySubject<string>(1);
    token.next('thetoken');
    let nextToken = () => token.next('nexttoken') || token;
    remote = new HalRemote(mockHttp, 'http://thehost', token, nextToken);
    HalRemoteCache.clear();
  });

  describe('expand', () => {

    it('returns the full url', () => {
      expect(remote.expand(link)).toEqual('http://thehost/foobar');
    });

    it('makes sure the link exists', () => {
      expect(remote.expand(null)).toBeNull();
      expect(remote.expand(<HalLink> {})).toBeNull();
    });

    it('interprets templated links', () => {
      link.href = '/link/{foo}{?bar}';
      link.templated = true;
      let params = {bar: 'two', foo: 'one', test: 'three'};
      expect(remote.expand(link, params)).toEqual('http://thehost/link/one?bar=two');
    });

  });

  describe('get', () => {

    it('sets the correct headers', () => {
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        expect(url).toEqual('http://thehost/somewhere');
        expect(options.headers.get('Accept')).toEqual('application/hal+json');
        expect(options.headers.get('Authorization')).toEqual('Bearer thetoken');
        return Observable.empty();
      });
      link.href = '/{foo}';
      link.templated = true;
      remote.get(link, {foo: 'somewhere'}).subscribe();
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('caches values for a short time', () => {
      let httpCount = 0;
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        return Observable.of(mockResponse({count: httpCount++}));
      });

      let completed = 0;
      remote.get(link).subscribe(data => completed++);
      expect(httpCount).toEqual(1);
      expect(completed).toEqual(1);

      remote.get(link).subscribe(data => completed++);
      expect(httpCount).toEqual(1);
      expect(completed).toEqual(2);

      HalRemoteCache.clear();
      remote.get(link).subscribe(data => completed++);
      expect(httpCount).toEqual(2);
      expect(completed).toEqual(3);
    });

    it('caches in-flight observables', function(done) {
      let httpCount = 0;
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        return Observable.of(mockResponse({count: httpCount++})).delay(100);
      });

      let completed = 0;
      remote.get(link).subscribe(data => completed++);
      remote.get(link).subscribe(data => completed++);
      remote.get(link).subscribe(data => completed++);

      expect(httpCount).toEqual(1);
      expect(completed).toEqual(0);
      setTimeout(() => {
        expect(httpCount).toEqual(1);
        expect(completed).toEqual(3);
        done();
      }, 200);
    });

  });

  describe('post', () => {

    it('sets the correct headers', () => {
      spyOn(mockHttp, 'post').and.callFake((url: any, body: string, options: any) => {
        expect(url).toEqual('http://thehost/foobar');
        expect(body).toEqual('{"hello":"world"}');
        expect(options.headers.get('Accept')).toEqual('application/hal+json');
        expect(options.headers.get('Authorization')).toEqual('Bearer thetoken');
        expect(options.headers.get('Content-Type')).toEqual('application/hal+json');
        return Observable.empty();
      });
      link.href = '/foobar';
      remote.post(link, {}, {hello: 'world'}).subscribe();
      expect(mockHttp.post).toHaveBeenCalled();
    });

  });

  describe('retries', () => {

    it('retries 401s after getting a new token', () => {
      let httpCount = 0;
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        if (httpCount > 0) {
          expect(options.headers.get('Authorization')).toEqual('Bearer nexttoken');
          return Observable.of(mockResponse({count: httpCount++}));
        } else {
          expect(options.headers.get('Authorization')).toEqual('Bearer thetoken');
          return Observable.of(mockResponse({count: httpCount++}, 401));
        }
      });

      let completed = 0, errored = 0;
      remote.get(link).subscribe(data => completed++, err => errored++);
      expect(httpCount).toEqual(2);
      expect(completed).toEqual(1);
      expect(errored).toEqual(0);
    });

    it('retries 401 responses only once before erroring', () => {
      let httpCount = 0;
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        return Observable.of(mockResponse({count: httpCount++}, 401));
      });

      let completed = 0, errored = 0;
      remote.get(link).subscribe(data => completed++, err => errored++);
      expect(httpCount).toEqual(2);
      expect(completed).toEqual(0);
      expect(errored).toEqual(1);
    });

  });

});
