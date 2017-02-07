import { fakeAsync, tick } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { HalDoc } from './haldoc';
import { HalRemote } from './halremote';

class MockRemote extends HalRemote {
  constructor(private getData = {}) {
    super(null, 'http://thehost', Observable.of('thetoken'));
  }
  get(link: any, params: {} = null): Observable<{}> {
    let key = link['href'];
    return Observable.of(this.getData[key]);
  }
  put(link, params, data): Observable<{}> {
    return Observable.of([data]);
  }
}

describe('HalDoc', () => {

  // disable error logging
  beforeEach(() => {
    spyOn(HalDoc.prototype, 'error').and.callFake((msg: string) => {
      return Observable.throw(new Error(msg));
    });
  });

  const makeRemote = (data = {}): MockRemote => {
    return new MockRemote(data);
  };
  const makeDoc = (data = {}, linkRemotes = {}) => {
    return new HalDoc(data, makeRemote(linkRemotes));
  };

  describe('constructor', () => {
    it('assigns attributes to new docs', () => {
      let doc = makeDoc({foo: 'bar', something: {nested: {here: 'okay'}}});
      expect(doc['foo']).toEqual('bar');
      expect(doc['something']['nested']['here']).toEqual('okay');
    });

    it('allows fields to be nulled', () => {
      let doc = makeDoc({foo: 'bar', something: {nested: {here: 'okay'}}, _links: {self: 'somewhere not here'}});
      doc.update({something: {nested: {here: 'okay'}}}).subscribe((updatedDoc) => {
        expect(updatedDoc['foo']).toBeUndefined();
      });
    });
  });

  xdescribe('save', () => {
    it('todo', () => {});
  });

  xdescribe('create', () => {
    it('todo', () => {});
  });

  xdescribe('destroy', () => {
    it('todo', () => {});
  });

  describe('expand', () => {
    it('returns the first link by rel', () => {
      let doc = makeDoc({_links: {
        somerel: [
          {href: '/link1href'},
          {href: '/link2href'}
        ]
      }});
      expect(doc.expand('somerel')).toEqual('http://thehost/link1href');
    });

    it('expands url templates', () => {
      let doc = makeDoc({_links: {
        somerel: {href: '/link/{foo}{?bar}', templated: true}
      }});
      let href = doc.expand('somerel', {bar: 'two', foo: 'one', test: 'three'});
      expect(href).toEqual('http://thehost/link/one?bar=two');
    });
  });

  describe('count', () => {
    it('gets the count from a link', () => {
      let doc = makeDoc({_links: {
        rel1: {},
        rel2: {count: 99},
        rel3: [{count: 1}, {count: 2}]
      }});
      expect(doc.count('rel1')).toBeUndefined();
      expect(doc.count('rel2')).toEqual(99);
      expect(doc.count('rel3')).toEqual(1);
      expect(doc.count('rel4')).toBeUndefined();
    });

    it('gets the embedded count from a collection', () => {
      expect(makeDoc({}).count()).toBeUndefined();
      expect(makeDoc({_count: 99}).count()).toEqual(99);
    });
  });

  describe('total', () => {
    it('gets the embedded total from a collection', () => {
      expect(makeDoc({}).total()).toBeUndefined();
      expect(makeDoc({_total: 99}).total()).toEqual(99);
    });
  });

  describe('has', () => {
    it('checks for links', () => {
      let doc = makeDoc({_links: {rel1: {}, rel2: null}});
      expect(doc.has('rel1')).toEqual(true);
      expect(doc.has('rel2')).toEqual(false);
      expect(doc.has('rel3')).toEqual(false);
    });

    it('checks for embeds', () => {
      let doc = makeDoc({_embedded: {rel1: [], rel2: null}});
      expect(doc.has('rel1')).toEqual(true);
      expect(doc.has('rel2')).toEqual(false);
      expect(doc.has('rel3')).toEqual(false);
    });
  });

  describe('isa', () => {
    let story = makeDoc({_links: {profile: {href: 'http://meta.prx.org/model/story'}}});
    let image = makeDoc({_links: {profile: {href: 'http://meta.prx.org/model/image/story'}}});
    let coll = makeDoc({_links: {profile: {href: 'http://meta.prx.org/model/collection/story'}}});

    it('recognizes models', () => {
      expect(story.isa('story')).toEqual(true);
      expect(story.isa('image')).toEqual(false);
      expect(image.isa('story')).toEqual(false);
      expect(image.isa('image')).toEqual(true);
    });

    it('differentiates collections', () => {
      expect(story.isa('story', false)).toEqual(true);
      expect(coll.isa('story', false)).toEqual(false);
      expect(coll.isa('story')).toEqual(true);
    });
  });

  describe('followLink', () => {
    it('http follows links', () => {
      let doc = makeDoc({}, {'/the/link': {foo: 'bar'}});
      doc.followLink({href: '/the/link'}).subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('bar');
      });
    });
  });

  describe('follow', () => {
    let data: any, linkData: any;
    beforeEach(() => {
      data = {
        _embedded: {somerel: {foo: 'the-embed'}},
        _links: {
          somerel: {href: '/the/link'},
          listrel: [
            {href: '/fetch/{id}{?something}'},
            {href: '/search{?foo,page,blah,bar}'}
          ]
        }
      };
      linkData = {
        '/the/link': {foo: 'the-link'},
        '/fetch/{id}{?something}': {foo: 'the-fetch'},
        '/search{?foo,page,blah,bar}': {foo: 'the-search'}
      };
    });

    it('picks embeds over links', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('somerel').subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('the-embed');
      });
    });

    it('wont pick embeds if you pass params', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('somerel', {some: 'params'}).subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('the-link');
      });
    });

    it('returns error if the link is an array', () => {
      data._links.somerel = [data._links.somerel];
      delete data._embedded;
      let doc = makeDoc(data, linkData);
      doc.follow('somerel').subscribe(
        (nextDoc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Expected object at _links.somerel'); }
      );
    });

    it('returns error if the embed is an array', () => {
      data._embedded.somerel = [data._embedded.somerel];
      delete data._links;
      let doc = makeDoc(data, linkData);
      doc.follow('somerel').subscribe(
        (nextDoc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Expected object at _embedded.somerel'); }
      );
    });

    it('returns error for not-found rels', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('otherrel').subscribe(
        (nextDoc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Unable to find rel otherrel'); }
      );
    });

    it('guesses fetch links when you provide an id', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('listrel', {id: 99}).subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('the-fetch');
      });
    });

    it('guesses search links when you give no id', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('listrel', {nothing: 'important'}).subscribe((nextDoc) => {
        expect(nextDoc['foo']).toEqual('the-search');
      });
    });
  });

  describe('followList', () => {
    let data: any, linkData: any;
    beforeEach(() => {
      data = {
        _embedded: {somerel: [{foo: 'the-embed1'}, {bar: 'the-embed2'}]},
        _links: {somerel: [{href: '/the/link1'}, {href: '/the/link2'}]}
      };
      linkData = {
        '/the/link1': {foo: 'the-link1'},
        '/the/link2': {bar: 'the-link2'}
      };
    });

    it('picks embeds over links', () => {
      let doc = makeDoc(data, linkData);
      doc.followList('somerel').subscribe((nextDocs) => {
        expect(nextDocs instanceof Array).toBeTruthy();
        expect(nextDocs[0] instanceof HalDoc).toBeTruthy();
        expect(nextDocs[0]['foo']).toEqual('the-embed1');
        expect(nextDocs[1]['bar']).toEqual('the-embed2');
      });
    });

    it('wont pick embeds if you pass params', () => {
      let doc = makeDoc(data, linkData);
      doc.followList('somerel', {some: 'params'}).subscribe((nextDocs) => {
        expect(nextDocs instanceof Array).toBeTruthy();
        expect(nextDocs[0] instanceof HalDoc).toBeTruthy();
        expect(nextDocs[0]['foo']).toEqual('the-link1');
        expect(nextDocs[1]['bar']).toEqual('the-link2');
      });
    });

    it('returns error if the link is an object', () => {
      data._links.somerel = data._links.somerel[0];
      delete data._embedded;
      let doc = makeDoc(data, linkData);
      doc.followList('somerel').subscribe(
        (nextDocs) => { fail('should not have gotten docs'); },
        (err) => { expect(err).toMatch('Expected array at _links.somerel'); }
      );
    });

    it('returns error if the embed is an array', () => {
      data._embedded.somerel = data._embedded.somerel[0];
      delete data._links;
      let doc = makeDoc(data, linkData);
      doc.followList('somerel').subscribe(
        (nextDoc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Expected array at _embedded.somerel'); }
      );
    });

    it('returns error for not-found rels', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('otherrel').subscribe(
        (nextDoc) => { fail('should not have gotten a doc'); },
        (err) => { expect(err).toMatch('Unable to find rel otherrel'); }
      );
    });
  });

  describe('followItems', () => {
    it('recursively follows the items of a link', () => {
      let data = {_links: {somerel: {href: '/the/link'}}};
      let linkData = {'/the/link': {
        total: 99,
        count: 2,
        _embedded: {'prx:items': [{foo: 'bar1'}, {foo: 'bar2'}]}
      }};
      let doc = makeDoc(data, linkData);
      doc.followItems('somerel').subscribe((itemDocs) => {
        expect(itemDocs instanceof Array).toBeTruthy();
        expect(itemDocs[0] instanceof HalDoc).toBeTruthy();
        expect(itemDocs[0]['foo']).toEqual('bar1');
        expect(itemDocs[0]['_total']).toEqual(99);
        expect(itemDocs[0]['_count']).toEqual(2);
        expect(itemDocs[1]['foo']).toEqual('bar2');
        expect(itemDocs[1]['_total']).toEqual(99);
        expect(itemDocs[1]['_count']).toEqual(2);
      });
    });
  });

  describe('HalObservable', () => {
    let data: any, linkData: any;
    beforeEach(() => {
      data = {_links: {rel1: {href: '/the/link1'}}};
      linkData = {
        '/the/link1': {
          _embedded: {'rel2': {_links: {rel3: {href: '/the/link2'}}}}
        },
        '/the/link2': {
          _embedded: {'prx:items': [{foo: 'bar1'}, {foo: 'bar2'}]}
        }
      };
    });

    it('nests HalDoc methods', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('rel1').follow('rel2').followItems('rel3').subscribe((itemDocs) => {
        expect(itemDocs instanceof Array).toBeTruthy();
        expect(itemDocs[0] instanceof HalDoc).toBeTruthy();
        expect(itemDocs[0]['foo']).toEqual('bar1');
        expect(itemDocs[1]['foo']).toEqual('bar2');
      });
    });

    it('returns error if part of the chain fails', () => {
      let doc = makeDoc(data, linkData);
      doc.follow('rel1').follow('foo').followItems('rel3').subscribe(
        (itemDocs) => { fail('should not have gotten docs'); },
        (err) => { expect(err).toMatch('Unable to find rel foo'); }
      );
    });
  });

});
