import { cms } from '../../../testing';
import { FeederFeedModel } from './feeder-feed.model';

describe('FeederFeedModel', () => {
  const podcast = cms().mock('prx:podcast', { id: 1, title: 'my podcast' });
  const data = {
    id: 1234,
    title: 'my-title',
    slug: 'my-slug',
    fileName: 'my-file.xml',
    private: true,
    tokens: [{ label: 'my-token', token: 'tok-1' }],
    url: 'https://some.where/feed',
    newFeedUrl: 'https://some.where/feed',
    enclosurePrefix: 'http://my.prefixer/',
    displayEpisodesCount: 100,
    displayFullEpisodesCount: 10,
    includeZones: ['house', 'sonic_id']
  };
  const doc = podcast.mock('prx-feed', data);

  let feed: FeederFeedModel;
  beforeEach(() => (feed = new FeederFeedModel(podcast, doc)));

  it('checks if a feed is default', () => {
    expect(feed.isDefault).toEqual(false);
    feed.slug = '';
    expect(feed.isDefault).toEqual(true);

    // if feed has a blank slug but is new, it is NOT the default
    feed.id = null;
    expect(feed.isDefault).toEqual(false);
  });

  it('sets defaults', () => {
    feed = new FeederFeedModel(podcast, podcast.mock('prx-feed', {}));

    // just look at the interesting defaults
    expect(feed.fileName).toEqual('feed-rss.xml');
    expect(feed.private).toEqual(false);
    expect(feed.tokens).toEqual([]);
    expect(feed.billboardAds).toEqual(true);
    expect(feed.houseAds).toEqual(true);
    expect(feed.paidAds).toEqual(true);
    expect(feed.sonicAds).toEqual(true);
  });

  it('round trips data', () => {
    ['id', 'title', 'slug', 'fileName', 'private', 'tokens', 'url', 'newFeedUrl', 'enclosurePrefix'].forEach((key) => {
      expect(feed[key]).toEqual(data[key]);
    });
    expect(feed.displayEpisodesCount).toEqual('100');
    expect(feed.displayFullEpisodesCount).toEqual('10');
    expect(feed.billboardAds).toEqual(false);
    expect(feed.houseAds).toEqual(true);
    expect(feed.paidAds).toEqual(false);
    expect(feed.sonicAds).toEqual(true);

    // exact same data should get returned
    expect(feed.encode()).toEqual(data);
  });

  it('encodes included ad types', () => {
    feed.billboardAds = true;
    feed.houseAds = false;
    feed.paidAds = true;
    feed.sonicAds = true;
    expect(feed.encode()['includeZones']).toEqual(['billboard', 'ad', 'sonic_id']);

    // if all are included, encodes to null
    feed.houseAds = true;
    expect(feed.encode()['includeZones']).toBeNull();
  });

  it('validates titles', () => {
    expect(feed.invalid('title')).toBeNull();

    feed.title = '';
    expect(feed.invalid('title')).toMatch(/is a required field/);

    // default feeds don't need titles
    feed.slug = '';
    expect(feed.invalid('title')).toBeNull();
  });

  it('validates slugs', () => {
    expect(feed.invalid('slug')).toBeNull();

    feed.slug = 'images';
    expect(feed.invalid('slug')).toMatch(/is reserved/);

    feed.slug = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    expect(feed.invalid('slug')).toMatch(/is reserved/);

    feed.slug = 'spaces not allowed';
    expect(feed.invalid('slug')).toMatch(/must contain only letters, numbers, underscores and dashes/);
  });

  it('validates fileNames', () => {
    expect(feed.invalid('fileName')).toBeNull();

    feed.fileName = 'slashes/not/allowed';
    expect(feed.invalid('fileName')).toMatch(/must contain only letters, numbers, underscores and dashes/);
  });

  it('validates tokens', () => {
    expect(feed.invalid('tokensJson')).toBeNull();

    feed.tokens = [];
    feed.setTokens();
    expect(feed.invalid('tokensJson')).toBeNull();

    feed.tokens = [{ label: 'only-label', token: '' }];
    feed.setTokens();
    expect(feed.invalid('tokensJson')).toMatch(/cannot have blank fields/);

    feed.tokens = [{ label: '', token: 'only-token' }];
    feed.setTokens();
    expect(feed.invalid('tokensJson')).toMatch(/cannot have blank fields/);
  });

  it('validates various url fields', () => {
    expect(feed.invalid('url')).toBeNull();
    expect(feed.invalid('newFeedUrl')).toBeNull();
    expect(feed.invalid('enclosurePrefix')).toBeNull();

    feed.url = 'some spaces';
    feed.newFeedUrl = 'bad$stuff';
    feed.enclosurePrefix = '***';
    expect(feed.invalid('url')).toMatch(/not a valid url/i);
    expect(feed.invalid('newFeedUrl')).toMatch(/not a valid url/i);
    expect(feed.invalid('enclosurePrefix')).toMatch(/not a valid url/i);
  });

  it('validates various count fields', () => {
    expect(feed.invalid('displayEpisodesCount')).toBeNull();
    expect(feed.invalid('displayFullEpisodesCount')).toBeNull();

    feed.displayEpisodesCount = '-1';
    feed.displayFullEpisodesCount = 'abc';
    expect(feed.invalid('displayEpisodesCount')).toMatch(/enter a positive number/i);
    expect(feed.invalid('displayFullEpisodesCount')).toMatch(/enter a positive number/i);
  });

  it('returns private feed urls', () => {
    expect(feed.privateFeedUrl()).toBeNull();

    const href = 'http://test.feed/123/my-slug/my-file.xml';
    feed.doc['_links'] = { 'prx:private-feed': { href } };
    expect(feed.privateFeedUrl()).toEqual(href);

    feed.fileName = 'else.xml';
    expect(feed.privateFeedUrl()).toEqual('http://test.feed/123/my-slug/else.xml');

    feed.slug = 'changed';
    expect(feed.privateFeedUrl()).toEqual('http://test.feed/123/changed/else.xml');

    feed.slug = '';
    feed.doc['_links']['prx:private-feed']['href'] = href.replace('/my-slug/', '/');
    expect(feed.privateFeedUrl()).toEqual('http://test.feed/123/else.xml');

    feed.doc['_links']['prx:private-feed']['href'] = href + '{?auth}';
    feed.doc['_links']['prx:private-feed']['templated'] = true;
    // TODO: MockHalDoc removes the remote adapter, so we can't expand links correctly
    // expect(feed.privateFeedUrl('token')).toEqual(href + '?auth=token');
  });

  it('returns published feed urls', () => {
    const href = 'http://test.feed/123/my-slug/my-file.xml';
    feed.doc['_links'] = { 'prx:private-feed': { href } };
    expect(feed.publishedFeedUrl()).toEqual(data.url);

    feed.url = '';
    expect(feed.publishedFeedUrl()).toEqual('http://test.feed/123/my-slug/my-file.xml');
  });

  it('adds and removes tokens', () => {
    expect(feed.tokens.length).toEqual(1);
    expect(feed.tokensJson).toEqual(JSON.stringify(feed.tokens));

    feed.addToken();
    expect(feed.tokens.length).toEqual(2);
    expect(feed.tokens[1].label).toEqual('');
    expect(feed.tokens[1].token.length).toBeGreaterThan(8);
    expect(feed.tokensJson).toEqual(JSON.stringify(feed.tokens));

    feed.removeToken(1);
    expect(feed.tokens.length).toEqual(1);
    expect(feed.tokensJson).toEqual(JSON.stringify(feed.tokens));
  });

  it('checks token label states', () => {
    expect(feed.labelChanged(0)).toEqual(false);
    expect(feed.labelInvalid(0)).toEqual(false);
    expect(feed.tokenChanged(0)).toEqual(false);
    expect(feed.tokenInvalid(0)).toEqual(false);

    feed.tokens[0].label = '';
    feed.tokens[0].token = '';
    feed.setTokens();
    expect(feed.labelChanged(0)).toEqual(true);
    expect(feed.labelInvalid(0)).toEqual(true);
    expect(feed.tokenChanged(0)).toEqual(true);
    expect(feed.tokenInvalid(0)).toEqual(true);
  });
});
