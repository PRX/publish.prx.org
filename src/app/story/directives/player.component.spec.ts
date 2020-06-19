import { cit, create, provide, cms } from '../../../testing';
import { Subject } from 'rxjs';
import { PlayerComponent } from './player.component';
import { StoryModel, DistributionModel } from '../../shared';
import { AuthService, TabService, MockHalService } from 'ngx-prx-styleguide';

let authToken = new Subject<string>();

describe('PlayerComponent', () => {
  create(PlayerComponent);

  let tabModel = new Subject<StoryModel>();
  provide(TabService, { model: tabModel });
  provide(AuthService, { token: authToken });

  let series, story;
  beforeEach(() => {
    series = cms().mock('prx:series', { title: 'ExistingSeriesTitle' });
    story = series.mock('prx:story', { title: 'ExistingStoryTitle' });
    story.mockItems('prx:images', []);
    story.mockItems('prx:audio-versions', []);
  });

  cit('uses feeder for series with a podcast distribution', (fix, el, comp) => {
    tabModel.next(new StoryModel(series, story));
    expect(comp.shouldUseFeeder).toEqual(false);
    series.mockItems('prx:distributions', [{ kind: 'podcast' }]);
    tabModel.next(new StoryModel(series, story));
    expect(comp.shouldUseFeeder).toEqual(true);
  });

  cit('loads data from cms', (fix, el, comp) => {
    story['_links'] = { alternate: { href: 'http://the-alt-href' } };
    story.mockItems('prx:images', [
      {
        status: 'complete',
        _links: { enclosure: { href: 'http://the-image-href' } }
      }
    ]);
    let versions = story.mockItems('prx:audio-versions', [{}]);
    versions[0].mockItems('prx:audio', [
      {
        status: 'complete',
        _links: { enclosure: { href: 'http://the-audio-href' } }
      }
    ]);

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
    let dist = series.mock('prx:distribution', { kind: 'podcast', url: 'http://some-where' });
    dist.mock('http://some-where', { publishedUrl: 'http://published-url' });
    let storyDists = story.mockItems('prx:distributions', [{ kind: 'episode', url: 'http://some-where/episode' }]);
    storyDists[0].mock('http://some-where/episode', { guid: 'episode1' });
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.feedUrl).toEqual('http://published-url');
    expect(comp.episodeGuid).toEqual('episode1');
  });

  cit('uses available enclosure url for unpublished', (fix, el, comp) => {
    let dist = series.mock('prx:distribution', { kind: 'podcast', url: 'http://some-where' });
    dist.mock('http://some-where', { publishedUrl: 'http://published-url', enclosurePrefix: 'http://prefix/' });
    let storyDists = story.mockItems('prx:distributions', [{ kind: 'episode', url: 'http://some-where/episode' }]);
    storyDists[0].mock('http://some-where/episode', {
      guid: 'episode1',
      _links: { enclosure: { href: 'http://prefix/some-where/enclosure.mp3' } }
    });
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.enclosurePrefix).toEqual('http://prefix/');
    expect(comp.enclosureUrl).toEqual('http://prefix/some-where/enclosure.mp3');
    authToken.next('atoken');
    expect(comp.previewEnclosure(comp.enclosureUrl)).toEqual('http://some-where/enclosure.mp3?_t=atoken');
  });

  cit('handles feeder load errors', (fix, el, comp) => {
    let dist = series.mock('prx:distribution', { kind: 'foobar' });
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.loadError).toMatch(/no podcast episode set/);

    let storyDists = story.mockItems('prx:distributions', [{ kind: 'episode', url: 'http://some-where/episode' }]);
    storyDists[0].mock('http://some-where/episode', { guid: null });
    comp.fromFeeder(new StoryModel(series, story), new DistributionModel(series, dist));
    expect(comp.loadError).toMatch(/unable to find the guid/);

    storyDists[0].mock('http://some-where/episode', { guid: 'the-guid' });
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

  cit('sets iframe dimensions to 650 x 200', (fix, el, comp) => {
    comp.feedUrl = 'http://some-where/episode';
    comp.episodeGuid = 'the-guid';
    series.mockItems('prx:distributions', [{ kind: 'podcast' }]);
    tabModel.next(new StoryModel(series, story));
    fix.detectChanges();
    expect(comp.copyIframe.search(/width="650"/)).not.toEqual(-1);
    expect(comp.copyIframe.search(/height="200"/)).not.toEqual(-1);
  });

  cit('shows the episode mp3 url for podcast distributions', (fix, el, comp) => {
    const dists = series.mockItems('prx:distributions', [{ kind: 'podcast', url: 'http://some-where' }]);
    dists[0].mock('http://some-where', { publishedUrl: 'http://published-url' });

    const storyDists = story.mockItems('prx:distributions', [{ kind: 'episode', url: 'http://some-where/episode' }]);
    storyDists[0].mock('http://some-where/episode', {
      guid: 'episode1',
      _links: { enclosure: { href: 'http://prefix/some-where/enclosure.mp3' } }
    });

    tabModel.next(new StoryModel(series, story));
    fix.detectChanges();
    expect(el).toContainText('Direct link to your episode');

    series.mockItems('prx:distributions', []);
    tabModel.next(new StoryModel(series, story));
    fix.detectChanges();
    expect(el).not.toContainText('Direct link to your episode');
  });
});
