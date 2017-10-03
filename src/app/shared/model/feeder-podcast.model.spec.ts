import { cms } from '../../../testing';
import { FeederPodcastModel } from './feeder-podcast.model';

describe('FeederPodcastModel', () => {

  let series = cms.mock('prx:series', {id: 'series1'});
  let dist = series.mock('prx:distributions', {id: 'dist1', kind: 'podcast'});
  let roleDist = series.mock('prx:accounts', {name: 'Foo', email: 'Bar'});

  beforeEach(() => window.localStorage.clear());

  it('decodes itunes categories', () => {
    let doc = dist.mock('some-feeder', {itunesCategories: [
      {name: 'Foo', subcategories: ['some', 'stuff']},
      {name: 'Bar', subcategories: []}
    ]});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('Foo');
    expect(podcast.subCategory).toEqual('some');
  });

  it('handles null subcategories', () => {
    let doc = dist.mock('some-feeder', {itunesCategories: [{name: 'Foo'}]});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('Foo');
    expect(podcast.subCategory).toEqual('');
  });

  it('handles null categories', () => {
    let doc = dist.mock('some-feeder', {});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('');
    expect(podcast.subCategory).toEqual('');
  });

  it('encodes categories', () => {
    let podcast = new FeederPodcastModel(series, dist);
    podcast.category = 'Foo';
    expect(podcast.encode()['itunesCategories']).toEqual([{name: 'Foo', subcategories: []}]);
    podcast.subCategory = 'Bar';
    expect(podcast.encode()['itunesCategories']).toEqual([{name: 'Foo', subcategories: ['Bar']}]);
  });

  it('copies to a different model', () => {
    let src = new FeederPodcastModel(series, dist);
    src.id = 1234;
    src.category = 'src-category';
    let dest = new FeederPodcastModel(series, dist);
    src.swapNew(dest);
    expect(dest.id).not.toEqual(1234);
    expect(dest.category).toEqual('src-category');
  });

  it('allows user to override account name and set author email for podcast', () => {
    ['author', 'owner', 'managingEditor'].forEach((role) => {
      let roleObj = {};
      roleObj[role] = {name: 'Foo2', email: 'Bar2'};
      let doc = roleDist.mock('some-feeder', roleObj);
      let podcast = new FeederPodcastModel(series, dist, doc);
      expect(podcast[`${role}Name`]).toEqual('Foo2');
      expect(podcast[`${role}Email`]).toEqual('Bar2');
    });
  });

  it('ensures URLs have http(s)', () => {
    let podcast = new FeederPodcastModel(series, dist);
    podcast.set('link', 'show.me');
    expect(podcast.link).toEqual('http://show.me');
    podcast.set('publicFeedUrl', 'https://notfeeder.prx.org');
    expect(podcast.publicFeedUrl).toEqual('https://notfeeder.prx.org');
    podcast.set('newFeedUrl', 'htshompson.party');
    expect(podcast.newFeedUrl).toEqual('http://htshompson.party');
    podcast.set('enclosurePrefix', 'redirect.me');
    expect(podcast.enclosurePrefix).toEqual('http://redirect.me');
  });

  it ('allows user to set other feed attributes', () => {
    let podcast = new FeederPodcastModel(series, dist);
    podcast.set('copyright', 'Copyright © 2017 PRX. All rights reserved.');
    expect(podcast.copyright).toEqual('Copyright © 2017 PRX. All rights reserved.');

    podcast.set('complete', true);
    expect(podcast.complete).toEqual(true);

    podcast.set('serialOrder', true);
    expect(podcast.serialOrder).toEqual(true);
  });

  it('makes language lower case', () => {
    let doc = dist.mock('some-feeder', {language: 'en-US'});
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.language).toEqual('en-us');
  });
});
