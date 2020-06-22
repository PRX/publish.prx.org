import { cit, create, provide, stubPipe, cms } from '../../../testing';
import { SeriesFeedComponent } from './series-feed.component';
import { TabService } from 'ngx-prx-styleguide';

describe('SeriesFeedComponent', () => {
  create(SeriesFeedComponent);

  provide(TabService);

  stubPipe('duration');

  cit('shows a loading spinner', (fix, el, comp) => {
    comp.isLoaded = false;
    fix.detectChanges();
    expect(el).toQuery('prx-spinner');
  });

  cit('does not render until the series is loaded', (fix, el, comp) => {
    expect(el).not.toContainText('stories');
    comp.series = {};
    comp.noStories = true;
    comp.isLoaded = true;
    fix.detectChanges();

    expect(el).toContainText('You have no episodes');
  });

  cit('displays story titles and publication status', (fix, el, comp) => {
    comp.series = {};
    comp.isLoaded = true;
    comp.publicStories = [{ title: 'First Public Story' }, { title: 'Second Public Story' }];
    comp.futurePublicStories = [{ title: 'Future Story' }];
    comp.privateStories = [{ title: 'Private Story' }];
    fix.detectChanges();
    expect(el).toContainText('Private Story');
    expect(el).toContainText('Future Story');
    expect(el).toContainText('First Public Story');
    expect(el).toContainText('Second Public Story');
  });

  cit('links to search and new story pages', (fix, el, comp) => {
    comp.series = { id: 'foo' };
    comp.isLoaded = true;
    fix.detectChanges();
    expect(el).toContainText('Search among');
    expect(el).toContainText('Create a new');
  });

  cit('highlights invalid stories', (fix, el, comp) => {
    comp.series = {};
    comp.isLoaded = true;
    comp.publicStories = [{ title: 'Second Public Story', status: 'complete' }];
    fix.detectChanges();
    expect(el).not.toQuery('.invalid');

    comp.publicStories = [
      { title: 'First Public Story', status: 'invalid' },
      { title: 'Second Public Story', status: 'complete' }
    ];
    fix.detectChanges();
    expect(el).toQuery('.invalid');
  });

  cit('pages through stories', (fix, el, comp) => {
    const series = cms().mock('prx:series', {});
    const storiesDoc = series.mock('prx:stories', { total: 2 });
    storiesDoc.mockList('prx:items', [{ title: 'First Page Story' }]);
    storiesDoc.mockItems('next', [{ title: 'Second Page Story' }]);

    comp.load(series);
    fix.detectChanges();

    expect(el).toContainText('First Page Story');
    expect(el).toContainText('Second Page Story');
  });
});
