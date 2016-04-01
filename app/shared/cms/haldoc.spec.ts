import {it, describe, expect, beforeEach} from 'angular2/testing';
import {Http, Response, ResponseOptions, RequestOptions} from 'angular2/http';
import {MockBackend} from 'angular2/http/testing';
import {Observable} from 'rxjs/Observable';
import {HalDoc} from './haldoc';

describe('HalDoc', () => {

  const mockHttp = new Http(new MockBackend(), new RequestOptions());
  const mockResponse = (data = {}) => {
    let res = new Response(new ResponseOptions({body: data}));
    return Observable.of(res);
  };
  const makeDoc = (data = {}) => {
    return new HalDoc(data, mockHttp, 'http://thehost', 'thetoken');
  };
  const makeLinks = (links = {}) => {
    return makeDoc({_links: links});
  };
  const makeEmbedded = (embed = {}) => {
    return makeDoc({_embedded: embed});
  };

  describe('constructor', () => {

    it('assigns attributes to new docs', () => {
      let doc = makeDoc({foo: 'bar', something: {nested: {here: 'okay'}}});
      expect(doc['foo']).toEqual('bar');
      expect(doc['something']['nested']['here']).toEqual('okay');
    });

  });

  describe('followLink', () => {

    it('http follows links', () => {
      spyOn(mockHttp, 'get').and.callFake((url: any, options: any) => {
        expect(url).toEqual('http://thehost/somewhere');
        expect(options.headers.get('Accept')).toEqual('application/json');
        expect(options.headers.get('Authorization')).toEqual('Bearer thetoken');
        return Observable.empty();
      });
      let doc = makeDoc();
      doc.followLink({href: '/{foo}', templated: true}, {foo: 'somewhere'});
      expect(mockHttp.get).toHaveBeenCalled();
    });

  });

  describe('follow', () => {

    it('picks embedded content over following a link', () => {
      spyOn(mockHttp, 'get').and.returnValue(Observable.empty());
      let doc = makeDoc({
        _embedded: {name: {foo: 'bar'}},
        _links: {name: {href: '/nowhere'}}
      });
      doc.follow('name').subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('bar');
      });
      expect(mockHttp.get).not.toHaveBeenCalled();
    });

    it('observes multiple links', () => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({foo: 'bar'}));
      let doc = makeLinks({name: [{href: '/one'}, {href: '/two'}]});
      doc.follow('name').subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('bar');
      });
      expect(mockHttp.get).toHaveBeenCalledTimes(2);
    });

    it('returns empty for non-existing links', () => {
      let doc = makeLinks({name: {href: '/one'}});
      let completed = false;
      doc.follow('notname').subscribe(
        (successDoc) => { fail('should not have gotten a doc'); },
        (err) => { fail('should not have gotten an error'); },
        () => { completed = true; }
      );
      expect(completed).toBeTruthy();
    });

  });

  describe('follows', () => {

    beforeEach(() => {
      spyOn(mockHttp, 'get').and.returnValue(mockResponse({
        _embedded: {rel2: [
          {_embedded: {rel3: [{hello: 'world'}]}},
          {_embedded: {rel3: [{hello: 'foobar'}]}},
          {_embedded: {relnot3: [{foo: 'bar'}]}}
        ]}
      }));
    });

    it('follows nested links/embeds', () => {
      let doc = makeLinks({rel1: {href: '/somewhere'}});
      let count = 0;
      doc.follows('rel1', 'rel2', 'rel3').subscribe((lastDoc) => {
        expect(lastDoc['hello']).toMatch(/world|foobar/);
        count++;
      });
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
      expect(count).toEqual(2);
    });

    it('returns empty if one rel in the chain does not exist', () => {
      let doc = makeLinks({rel1: {href: '/somewhere'}});
      let completed = false;
      doc.follows('rel1', 'relnothing', 'rel3').subscribe(
        (successDoc) => { fail('should not have gotten a doc'); },
        (err) => { fail('should not have gotten an error'); },
        () => { completed = true; }
      );
      expect(completed).toBeTruthy();
    });

  });

  describe('links', () => {

    it('returns links array by rel', () => {
      let links = makeLinks({name: ['foo', 'bar']}).links('name');
      expect(links.length).toEqual(2);
      expect(links).toEqual(['foo', 'bar']);
    });

    it('returns null for undefined rels', () => {
      expect(makeLinks().links('name')).toBeNull();
    });

    it('returns arrays for singular links', () => {
      let links = makeLinks({name: {foo: 'bar'}}).links('name');
      expect(links.length).toEqual(1);
      expect(links[0]['foo']).toEqual('bar');
    });

  });

  describe('link', () => {

    it('returns the first link by rel', () => {
      let doc = makeLinks({name: [
        { href: '/link1href' },
        { href: '/link2href' }
      ]});
      expect(doc.link('name')).toEqual('http://thehost/link1href');
    });

    it('expands url templates', () => {
      let doc = makeLinks({name: [{href: '/link/{foo}{?bar}', templated: true}]});
      let href = doc.link('name', {bar: 'two', foo: 'one', test: 'three'});
      expect(href).toEqual('http://thehost/link/one?bar=two');
    });

  });

  describe('embeds', () => {

    it('returns embedded array by rel', () => {
      let embeds = makeEmbedded({name: [{foo: 1}, {bar: 2}]}).embeds('name');
      expect(embeds.length).toEqual(2);
      expect(embeds[0]['foo']).toEqual(1);
      expect(embeds[1]['bar']).toEqual(2);
    });

    it('returns empty for empty rels', () => {
      expect(makeEmbedded({name: []}).embeds('name')).toEqual([]);
    });

    it('returns null for undefined rels', () => {
      expect(makeEmbedded().embeds('name')).toBeNull;
    });

    it('returns arrays for singular links', () => {
      let embeds = makeEmbedded({name: {foo: 'bar'}}).embeds('name');
      expect(embeds.length).toEqual(1);
      expect(embeds[0]['foo']).toEqual('bar');
    });

  });

});
