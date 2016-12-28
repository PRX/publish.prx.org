import { cms } from '../../../testing';
import { FeederPodcastModel } from './feeder-podcast.model';

describe('FeederPodcastModel', () => {

  let series = cms.mock('prx:series', {id: 'series1'});
  let dist = series.mock('prx:distributions', {id: 'dist1', kind: 'podcast'});

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
    spyOn(src, 'unstore').and.stub();
    let dest = new FeederPodcastModel(series, dist);
    src.copyTo(dest);
    expect(dest.id).not.toEqual(1234);
    expect(dest.category).toEqual('src-category');
    expect(src.unstore).toHaveBeenCalled();
  });

  it('updates the publishedUrl with changes to the custom path', () => {
    let src = new FeederPodcastModel(series, dist);
    src.publishedUrl = 'http://staging-f.prxu.org/doesnotsaythebestpodcast/feed-rss.xml';
    src.set('path', 'the_best_podcast');
    src.save();
    expect(src.publishedUrl).toEqual('http://staging-f.prxu.org/the_best_podcast/feed-rss.xml');
  });

});
