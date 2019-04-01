import { cit, create, cms, stubPipe, stub } from '../../testing';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { DashboardSeriesComponent } from './dashboard-series.component';
import { SeriesModel } from 'app/shared';


describe('DashboardSeriesComponent', () => {

  create(DashboardSeriesComponent, false);

  stubPipe('timeago');
  stubPipe('capitalize');

  let auth;
  let series;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {});
    auth.mock('prx:series', {}).mockItems('prx:stories', []);
    auth.mockItems('prx:stories', []);
    series = new SeriesModel(auth, new MockHalDoc({id: 99, count: () => 1}));
  });

  cit('displays standalone stories', (fix, el, comp) => {
    comp.noseries = true;
    comp.auth = auth;
    fix.detectChanges();
    expect(el).toContainText('Your Standalone Episodes');
  });

  describe('Series', () => {
    beforeEach(() => {
    });

    cit('provides a link to the series', (fix, el, comp) => {
      comp.noseries = false;
      comp.series = series;
      fix.detectChanges();
      expect(el).toQueryAttr('.title > a', 'href', '/series/99');
      expect(el).toQueryAttr('h1 a', 'href', '/series/99');
    });

    cit('provides a link to view all stories in a series', (fix, el, comp) => {
      comp.noseries = false;
      comp.series = series;
      fix.detectChanges();
      expect(el).toQueryAttr('p.count a', 'href', '/search;tab=stories;seriesId=99');
    });

    cit('filters by publish state', (fix, el, comp) => {
      comp.noseries = false;
      comp.series = series;
      spyOn(comp, 'loadSeriesStories');
      spyOn(comp, 'loadStandaloneStories');
      comp.filterByPublishState('published');
      expect(comp.loadSeriesStories).toHaveBeenCalled();
      comp.noseries = true;
      comp.filterByPublishState('draft');
      expect(comp.loadStandaloneStories).toHaveBeenCalled();
    });
  })


});
