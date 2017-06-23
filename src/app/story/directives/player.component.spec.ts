import { cit, create, provide, cms } from '../../../testing';
import { Subject } from 'rxjs/Subject';
import { PlayerComponent } from './player.component';
import { StoryModel, DistributionModel, TabService } from '../../shared';

describe('PlayerComponent', () => {

  create(PlayerComponent);

  let tabModel = new Subject<StoryModel>();
  provide(TabService, {model: tabModel});

  let series, story;
  beforeEach(() => {
    series = cms.mock('prx:series', {title: 'ExistingSeriesTitle'});
    story = series.mock('prx:story', {title: 'ExistingStoryTitle'});
    story.mockItems('prx:images', []);
    story.mockItems('prx:audio-versions', []);
  });

  cit('uses feeder for series with a podcast distribution', (fix, el, comp) => {
    tabModel.next(new StoryModel(series, story));
    expect(comp.shouldUseFeeder).toEqual(false);
    series.mockItems('prx:distributions', [{kind: 'podcast'}]);
    tabModel.next(new StoryModel(series, story));
    expect(comp.shouldUseFeeder).toEqual(true);
  });

  cit('loads data from cms', (fix, el, comp) => {
    story['_links'] = {alternate: {href: 'http://the-alt-href'}};
    story.mockItems('prx:images', [{
      status: 'complete',
      _links: {enclosure: {href: 'http://the-image-href'}}
    }]);
    let versions = story.mockItems('prx:audio-versions', [{}]);
    versions[0].mockItems('prx:audio', [{
      status: 'complete',
      _links: {enclosure: {href: 'http://the-audio-href'}}
    }]);

    comp.fromStory(new StoryModel(series, story));
    expect(comp.title).toEqual('ExistingStoryTitle');
    expect(comp.subtitle).toEqual('ExistingSeriesTitle');
    expect(comp.audioUrl).toEqual('http://the-audio-href');
    expect(comp.imageUrl).toEqual('http://the-image-href');
    expect(comp.subscriptionUrl).toEqual('http://the-alt-href');
  });

  cit('has defaults for cms data', (fix, el, comp) => {
    comp.fromStory(new StoryModel(series, story));
    expect(comp.audioUrl).toMatch(/s3\.amazonaws\.com/);
    expect(comp.imageUrl).toMatch(/s3\.amazonaws\.com/);
    expect(comp.subscriptionUrl).toMatch(/prx\.org/);
  });

  cit('loads data from feeder', (fix, el, comp) => {
    let dist = series.mock('prx:distribution', {kind: 'podcast', url: 'http://some-where'});
    dist.mock('http://some-where', {publishedUrl: 'http://published-url'});
    let storyDists = story.mockItems('prx:distributions', [{kind: 'episode', url: 'http://some-where/episode'}]);
    storyDists[0].mock('http://some-where/episode', {guid: 'episode1'});
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.feedUrl).toEqual('http://published-url');
    expect(comp.episodeGuid).toEqual('episode1');
  });

  cit('handles feeder load errors', (fix, el, comp) => {
    let dist = series.mock('prx:distribution', {kind: 'foobar'});
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.loadError).toMatch(/no podcast episode set/);

    let storyDists = story.mockItems('prx:distributions', [{kind: 'episode', url: 'http://some-where/episode'}]);
    storyDists[0].mock('http://some-where/episode', {guid: null});
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.loadError).toMatch(/unable to find the guid/);

    storyDists[0].mock('http://some-where/episode', {guid: 'the-guid'});
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.loadError).toMatch(/unable to find the public URL/);
  });

  cit('warns when using defaults for cms data', (fix, el, comp) => {
    tabModel.next(new StoryModel(series, story));
    expect(comp.audioUrl).toMatch(/s3\.amazonaws\.com/);
    expect(comp.imageUrl).toMatch(/s3\.amazonaws\.com/);
    fix.detectChanges();
    expect(el).toContainText('no audio or image');
  });

});
