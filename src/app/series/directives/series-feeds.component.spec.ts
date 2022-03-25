import { cit, create, provide, stubPipe, cms } from '../../../testing';
import { SeriesFeedsComponent } from './series-feeds.component';
import { SeriesModel, FeederFeedModel } from 'app/shared';
import { TabService } from 'ngx-prx-styleguide';

describe('SeriesFeedsComponent', () => {
  create(SeriesFeedsComponent);

  provide(TabService);

  cit('shows an error message if you have no podcast distribution', (fix, el, comp) => {
    const series = cms().mock('prx:series', { id: 'some-id' });

    comp.load(new SeriesModel(null, series, false));
    fix.detectChanges();

    expect(el).toContainText('No feeds found');
  });

  cit('displays feeds', (fix, el, comp) => {
    const podcastUrl = 'http://some.where/your/podcast/1234';
    const series = cms().mock('prx:series', {});
    const [dist] = series.mockItems('prx:distributions', [{ kind: 'podcast', url: podcastUrl }]);
    const podcast = dist.mock(podcastUrl, { title: 'pod1' });
    podcast.mockItems('prx:feeds', [
      { id: 1, slug: '', fileName: 'default.xml' },
      { id: 2, title: 'Some Private Feed', slug: 'private', fileName: 'private.xml' },
      { id: 3, title: 'Some Public Feed', slug: 'public', fileName: 'public.xml' }
    ]);

    comp.load(new SeriesModel(null, series, false));
    fix.detectChanges();

    expect(el).toContainText('Default Feed');
    expect(el).toContainText('Some Private Feed');
    expect(el).toContainText('Some Public Feed');
  });

  cit('confirms urls changing', (fix, el, comp) => {
    const doc = cms().mock('prx:feed', { id: 1234, url: 'original-url' });
    const feed = new FeederFeedModel(null, doc);

    feed.set('url', 'updated-url');
    expect(comp.urlConfirm(feed)).toMatch(/are you sure you want to change/i);

    // pretend the original was blank
    feed.set('url', '', true);
    feed.set('url', 'updated-url');
    expect(comp.urlConfirm(feed)).toBeFalsy();
  });

  cit('confirms new-feed-urls changing', (fix, el, comp) => {
    const doc = cms().mock('prx:feed', { id: 1234, url: 'original-url', newFeedUrl: 'original-url' });
    const feed = new FeederFeedModel(null, doc);

    feed.set('newFeedUrl', 'updated-url');
    expect(comp.urlConfirm(feed)).toMatch(/are you sure you want to change/i);

    // also shows up if new feed url _was_ blank
    feed.set('newFeedUrl', '', true);
    feed.set('newFeedUrl', 'updated-url');
    expect(comp.urlConfirm(feed)).toMatch(/are you sure you want to change/i);
  });
});
