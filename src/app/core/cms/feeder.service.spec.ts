import { Http, Response, ResponseOptions, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import { FeederService } from './feeder.service';
import { HalRemoteCache } from './halremote.cache';

describe('FeederService', () => {

  beforeEach(() => {
    HalRemoteCache.clear();
  });

  const mockHttp = new Http(new MockBackend(), new RequestOptions());
  const mockResponse = (data = {}, status = 200) => {
    let res = new Response(new ResponseOptions({body: data, status: status}));
    return Observable.of(res);
  };

  describe('constructor via abstract service base class', () => {
    it('immediately gets the root doc', () => {
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        expect(url).toMatch(/\/api\/v1$/);
        return mockResponse({foo: 'bar'});
      });
      let feeder = new FeederService(mockHttp);
      expect(feeder.token instanceof Observable).toBeTruthy();
      expect(feeder.root instanceof Observable).toBeTruthy();
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('token', () => {
    it('only sets one token at a time', () => {
      let feeder = new FeederService(mockHttp);
      let count = 0;
      feeder.token.subscribe((token) => {
        count++;
        expect(token).toEqual(`token#${count}`);
      });
      feeder.setToken('token#1');
      feeder.setToken('token#2');
      expect(count).toEqual(2);
    });
  });

  describe('root', () => {
    it('does not allow unauthorized root requests', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}));
      let feeder = new FeederService(mockHttp);
      feeder.root.subscribe(
        (doc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch(/Unauthorized/); }
      );
      feeder.setToken(null);
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('can fail to fetch the doc', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}, 500));
      let feeder = new FeederService(mockHttp);
      feeder.root.subscribe(
        (doc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Got 500 from GET http'); }
      );
      feeder.setToken('thetoken');
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('replays the root document', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}));
      let feeder = new FeederService(mockHttp);
      let count = 0;
      feeder.root.subscribe(() => { count++; });
      feeder.root.subscribe(() => { count++; });
      feeder.root.subscribe(() => { count++; });
      feeder.setToken('thetoken');
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
      expect(count).toEqual(3);
    });
  });

  describe('follow', () => {
    it('links off the root document', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({
        _embedded: {
          rel1: {hello: 'world'}
        }
      }));
      let feeder = new FeederService(mockHttp);
      feeder.setToken('thetoken');
      let count = 0;
      feeder.follow('rel1').subscribe((doc) => {
        expect(doc['hello']).toEqual('world');
        count++;
      });
      expect(mockHttp.get).toHaveBeenCalled();
      expect(count).toEqual(1);
    });
  });
});
