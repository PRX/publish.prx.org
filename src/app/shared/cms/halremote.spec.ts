import { Http, Response, ResponseOptions, RequestOptions } from '@angular/http';
import { MockBackend} from '@angular/http/testing';
import { Observable} from 'rxjs';
import { HalRemote } from './halremote';
import { HalLink } from './hallink';

describe('HalRemote', () => {

  const mockHttp = new Http(new MockBackend(), new RequestOptions());
  const mockResponse = (data = {}, status = 200) => {
    return new Response(new ResponseOptions({body: JSON.stringify(data), status}));
  };

  let remote: HalRemote, link: HalLink;
  beforeEach(() => {
    link = <HalLink> {href: '/foobar'};
    remote = new HalRemote(mockHttp, 'http://thehost', 'thetoken');
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
      remote.get(link, {foo: 'somewhere'});
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('caches for a short time', () => {
      let count = 0;
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        return Observable.of(mockResponse({count: count++}));
      });

      let completed = 0;
      remote.get(link).subscribe((data: any) => {
        expect(data.count).toEqual(0);
        completed++;
      });
      remote.get(link).subscribe((data: any) => {
        expect(data.count).toEqual(0);
        completed++;
      });
      expect(completed).toEqual(2);
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
      remote.post(link, {}, {hello: 'world'});
      expect(mockHttp.post).toHaveBeenCalled();
    });

  });

});
