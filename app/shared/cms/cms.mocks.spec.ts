import {it, describe, expect} from '@angular/core/testing';
import {MockCmsService} from './cms.mocks';

describe('CmsService', () => {

  it('mocks top-level rels', () => {
    let cms = new MockCmsService();
    cms.mock('foo', {hello: 'world'});
    cms.follow('foo').subscribe((doc) => {
      expect(doc['hello']).toEqual('world');
    });
  });

  it('mocks nested rels', () => {
    let cms = new MockCmsService();
    let foo = cms.mock('foo', {hello: 'world'});
    foo.mock('bar', {hello: 'there'});
    cms.follow('foo').follow('bar').subscribe((doc) => {
      expect(doc['hello']).toEqual('there');
    });
  });

  it('mocks arrays', () => {
    let cms = new MockCmsService();
    let foo = cms.mock('foo', {hello: 'world'});
    foo.mockList('bar', [{thing: 'one'}, {thing: 'two'}]);
    cms.follow('foo').followList('bar').subscribe((docs) => {
      expect(docs).toBeAnInstanceOf(Array);
      expect(docs.length).toEqual(2);
      expect(docs[0]['thing']).toEqual('one');
      expect(docs[1]['thing']).toEqual('two');
    });
  });

  it('mocks items', () => {
    let cms = new MockCmsService();
    cms.mockItems('foo',[{thing: 'one'}, {thing: 'two'}]);
    cms.followItems('foo').subscribe((docs) => {
      expect(docs).toBeAnInstanceOf(Array);
      expect(docs.length).toEqual(2);
      expect(docs[0]['thing']).toEqual('one');
      expect(docs[1]['thing']).toEqual('two');
    });
  });

});
