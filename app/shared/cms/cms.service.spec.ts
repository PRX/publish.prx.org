import {it, describe, expect} from 'angular2/testing';
import {Http, Response, ResponseOptions, RequestOptions} from 'angular2/http';
import {MockBackend} from 'angular2/http/testing';
import {Observable} from 'rxjs/Observable';
import {CmsService} from './cms.service';

describe('CmsService', () => {

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
      expect(cms.authToken).toBeAnInstanceOf(Observable);
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
    });

  });

  describe('token', () => {

    it('only sets one token at a time', () => {
      let cms = new CmsService(mockHttp);
      let count = 0;
      cms.authToken.subscribe((token) => {
        count++;
        expect(token).toEqual(`token#${count}`);
      });
      cms.token = 'token#1';
      cms.token = 'token#2';
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
      cms.token = null;
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('can fail to fetch the doc', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}, 500));
      let cms = new CmsService(mockHttp);
      cms.root.subscribe(
        (doc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch(/Got 500 from http/); }
      );
      cms.token = 'thetoken';
      expect(mockHttp.get).toHaveBeenCalled();
    });

    it('replays the root document', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}));
      let cms = new CmsService(mockHttp);
      let count = 0;
      cms.root.subscribe(() => { count++; });
      cms.root.subscribe(() => { count++; });
      cms.root.subscribe(() => { count++; });
      cms.token = 'thetoken';
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
      cms.token = 'thetoken';
      let count = 0;
      cms.follow('rel1').subscribe((doc) => {
        expect(doc['hello']).toEqual('world');
        count++;
      });
      expect(mockHttp.get).toHaveBeenCalled();
      expect(count).toEqual(1);
    });

  });

  describe('follows', () => {

    it('nested links off the root document', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({
        _embedded: {
          rel1: {
            _embedded: {
              rel2: {
                hello: 'thereworld'
              }
            }
          }
        }
      }));
      let cms = new CmsService(mockHttp);
      cms.token = 'thetoken';
      let count = 0;
      cms.follows('rel1', 'rel2').subscribe((doc) => {
        expect(doc['hello']).toEqual('thereworld');
        count++;
      });
      expect(mockHttp.get).toHaveBeenCalled();
      expect(count).toEqual(1);
    });

  });

});
