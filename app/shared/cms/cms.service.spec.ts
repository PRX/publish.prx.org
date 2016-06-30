import {it, describe, expect, beforeEach} from '@angular/core/testing';
import {Http, Response, ResponseOptions, RequestOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Observable} from 'rxjs/Observable';
import {CmsService} from './cms.service';
import {HalRemoteCache} from './halremote.cache';

describe('CmsService', () => {

  beforeEach(() => {
    HalRemoteCache.clear();
  });

  const mockHttp = new Http(new MockBackend(), new RequestOptions());
  const mockResponse = (data = {}, status = 200) => {
    let res = new Response(new ResponseOptions({body: data, status: status}));
    return Observable.of(res);
  };

  describe('constructor', () => {

    it('immediately gets the root doc', () => {
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        expect(url).toMatch(/\/api\/v1$/);
        return mockResponse({foo: 'bar'});
      });
      let cms = new CmsService(mockHttp);
      expect(cms.token).toBeAnInstanceOf(Observable);
      expect(cms.root).toBeAnInstanceOf(Observable);
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
    });

  });

  describe('token', () => {

    it('only sets one token at a time', () => {
      let cms = new CmsService(mockHttp);
      let count = 0;
      cms.token.subscribe((token) => {
        count++;
        expect(token).toEqual(`token#${count}`);
      });
      cms.setToken('token#1');
      cms.setToken('token#2');
      expect(count).toEqual(2);
    });

  });

  describe('root', () => {

    it('does not allow unauthorized root requests', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}));
      let cms = new CmsService(mockHttp);
      cms.root.subscribe(
        (doc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch(/Unauthorized/); }
      );
      cms.setToken(null);
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('can fail to fetch the doc', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}, 500));
      let cms = new CmsService(mockHttp);
      cms.root.subscribe(
        (doc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Got 500 from GET http'); }
      );
      cms.setToken('thetoken');
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('replays the root document', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}));
      let cms = new CmsService(mockHttp);
      let count = 0;
      cms.root.subscribe(() => { count++; });
      cms.root.subscribe(() => { count++; });
      cms.root.subscribe(() => { count++; });
      cms.setToken('thetoken');
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
      let cms = new CmsService(mockHttp);
      cms.setToken('thetoken');
      let count = 0;
      cms.follow('rel1').subscribe((doc) => {
        expect(doc['hello']).toEqual('world');
        count++;
      });
      expect(mockHttp.get).toHaveBeenCalled();
      expect(count).toEqual(1);
    });

  });

});
