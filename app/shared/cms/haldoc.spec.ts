import { HalDoc } from './haldoc';
import { it, describe, expect, beforeEach, beforeEachProviders, inject, injectAsync } from 'angular2/testing';
import {provide} from 'angular2/core';
import {Http, HTTP_PROVIDERS, XHRBackend, Response, ResponseOptions, RequestOptions, ConnectionBackend} from 'angular2/http';
import {MockBackend, MockConnection} from 'angular2/http/testing';
import {Observable} from 'rxjs/Observable';

let mockBackend = new MockBackend();
const mockResponse = (data = {}) => {
  mockBackend.connections.subscribe((conn: MockConnection) => {
    conn.mockRespond(new Response(new ResponseOptions({body: data})));
  });
}
const makeDoc = (data = {}) => {
  let http = new Http(mockBackend, new RequestOptions());
  return new HalDoc(data, http, 'http://thehost', 'thetoken');
}
const makeLinks = (links = {}) => {
  return makeDoc({_links: links});
}
const makeEmbedded = (embed = {}) => {
  return makeDoc({_embedded: embed});
}

describe('HalDoc', () => {

  describe('constructor', () => {

    it('assigns attributes to new docs', () => {
      let doc = makeDoc({foo: 'bar', something: {nested: {here: 'okay'}}})
      expect(doc['foo']).toEqual('bar');
      expect(doc['something']['nested']['here']).toEqual('okay');
    });

  });

  describe('followLink', () => {

    it('http follows links', () => {
      let http = new Http(mockBackend, new RequestOptions());
      http.get = (url: any, options: any): any => {
        expect(url).toEqual('http://thehost/somewhere');
        expect(options.headers.get('Accept')).toEqual('application/json');
        expect(options.headers.get('Authorization')).toEqual('Bearer thetoken');
        return Observable.empty();
      };
      let doc = new HalDoc({foo: 'bar'}, http, 'http://thehost', 'thetoken');
      doc.followLink({href: '/{foo}', templated: true}, {foo: 'somewhere'});
    });

  });

  describe('follow', () => {

  });

  describe('follows', () => {

  });

  describe('links', () => {

    it('returns links array by rel', () => {
      let links = makeLinks({name: ['foo', 'bar']}).links('name');
      expect(links.length).toEqual(2);
      expect(links).toEqual(['foo', 'bar']);
    });

    it('returns empty for undefined rels', () => {
      expect(makeLinks().links('name')).toEqual([]);
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
        { href: '/link2href' },
      ]});
      expect(doc.link('name')).toEqual('http://thehost/link1href');
    });

    it('expands url templates', () => {
      let doc = makeLinks({name: [{href: '/link/{foo}{?bar}', templated: true}]});
      let href = doc.link('name', {foo: 'one', bar: 'two', test: 'three'});
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
