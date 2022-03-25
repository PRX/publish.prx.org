import { cms } from '../../../testing';
import { FeederPodcastModel } from './feeder-podcast.model';

describe('FeederPodcastModel', () => {
  let series = cms().mock('prx:series', { id: 'series1' });
  let dist = series.mock('prx:distributions', { id: 'dist1', kind: 'podcast' });
  let roleDist = series.mock('prx:accounts', { name: 'Foo', email: 'Bar' });

  it('decodes itunes categories', () => {
    let doc = dist.mock('some-feeder', {
      itunesCategories: [
        { name: 'Foo', subcategories: ['some', 'stuff'] },
        { name: 'Bar', subcategories: [] }
      ]
    });
    let podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('Foo');
    expect(podcast.subCategory).toEqual('some');
  });

  it('handles null subcategories', () => {
    const doc = dist.mock('some-feeder', { itunesCategories: [{ name: 'Foo' }] });
    const podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('Foo');
    expect(podcast.subCategory).toEqual('');
  });

  it('handles null categories', () => {
    const doc = dist.mock('some-feeder', {});
    const podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.category).toEqual('');
    expect(podcast.subCategory).toEqual('');
  });

  it('encodes categories', () => {
    const podcast = new FeederPodcastModel(series, dist);
    podcast.category = 'Foo';
    expect(podcast.encode()['itunesCategories']).toEqual([{ name: 'Foo', subcategories: [] }]);
    podcast.subCategory = 'Bar';
    expect(podcast.encode()['itunesCategories']).toEqual([{ name: 'Foo', subcategories: ['Bar'] }]);
  });

  it('copies to a different model', () => {
    const src = new FeederPodcastModel(series, dist);
    src.id = 1234;
    src.category = 'src-category';
    const dest = new FeederPodcastModel(series, dist);
    src.swapNew(dest);
    expect(dest.id).not.toEqual(1234);
    expect(dest.category).toEqual('src-category');
  });

  it('allows user to override account name and set author email for podcast', () => {
    ['author', 'owner', 'managingEditor'].forEach((role) => {
      const roleObj = {};
      roleObj[role] = { name: 'Foo2', email: 'Bar2' };
      const doc = roleDist.mock('some-feeder', roleObj);
      const podcast = new FeederPodcastModel(series, dist, doc);
      expect(podcast[`${role}Name`]).toEqual('Foo2');
      expect(podcast[`${role}Email`]).toEqual('Bar2');
    });
  });

  it('ensures URLs have http(s)', () => {
    const podcast = new FeederPodcastModel(series, dist);
    podcast.set('link', 'show.me');
    expect(podcast.link).toEqual('http://show.me');
    podcast.set('publicFeedUrl', 'https://notfeeder.prx.org');
    expect(podcast.publicFeedUrl).toEqual('https://notfeeder.prx.org');
    podcast.set('newFeedUrl', 'htshompson.party');
    expect(podcast.newFeedUrl).toEqual('http://htshompson.party');
    podcast.set('enclosurePrefix', 'redirect.me');
    expect(podcast.enclosurePrefix).toEqual('http://redirect.me');
  });

  it('allows user to set other feed attributes', () => {
    const podcast = new FeederPodcastModel(series, dist);
    podcast.set('copyright', 'Copyright © 2017 PRX. All rights reserved.');
    expect(podcast.copyright).toEqual('Copyright © 2017 PRX. All rights reserved.');

    podcast.set('complete', true);
    expect(podcast.complete).toEqual(true);

    podcast.set('serialOrder', true);
    expect(podcast.serialOrder).toEqual(true);
  });

  it('makes language lower case', () => {
    const doc = dist.mock('some-feeder', { language: 'en-US' });
    const podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.language).toEqual('en-us');
  });

  it('treats feeder episode limits as strings', () => {
    const doc = dist.mock('some-feeder', { displayEpisodesCount: 123, displayFullEpisodesCount: 456 });
    const podcast = new FeederPodcastModel(series, dist, doc);
    expect(podcast.displayEpisodesCount).toEqual('123');
    expect(podcast.displayFullEpisodesCount).toEqual('456');
    expect(podcast.encode()['displayEpisodesCount']).toEqual(123);
    expect(podcast.encode()['displayFullEpisodesCount']).toEqual(456);
  });

  it('validates feeder episode limits', () => {
    const podcast = new FeederPodcastModel(series, dist);
    podcast.set('displayEpisodesCount', '-1');
    podcast.set('displayFullEpisodesCount', 'abc');
    expect(podcast.invalid('displayEpisodesCount')).toMatch(/enter a positive number/i);
    expect(podcast.invalid('displayFullEpisodesCount')).toMatch(/enter a positive number/i);

    podcast.set('displayEpisodesCount', '');
    podcast.set('displayFullEpisodesCount', '1');
    expect(podcast.invalid('displayEpisodesCount')).toBeFalsy();
    expect(podcast.invalid('displayFullEpisodesCount')).toBeFalsy();
  });

  it('loads the feeder feeds in sorted order', () => {
    const doc = dist.mock('some-feeder', { id: 'pod1' });
    doc.mockItems('prx:feeds', [
      { id: 3, title: 'feed three' },
      { id: 1, title: 'feed one' },
      { id: 2, title: 'feed two' }
    ]);

    const podcast = new FeederPodcastModel(series, dist, doc, false);
    podcast.loadRelated('feeds');
    expect(podcast.feeds.length).toEqual(3);
    expect(podcast.feeds[0].title).toEqual('feed one');
    expect(podcast.feeds[1].title).toEqual('feed two');
    expect(podcast.feeds[2].title).toEqual('feed three');
  });
});
