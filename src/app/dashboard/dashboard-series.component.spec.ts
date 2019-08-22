import { cit, create, cms, stubPipe } from '../../testing';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { DashboardSeriesComponent } from './dashboard-series.component';
import { SeriesModel } from 'app/shared';


describe('DashboardSeriesComponent', () => {

  create(DashboardSeriesComponent, false);

  stubPipe('timeago');

  let auth;
  let account;
  let series;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    account = auth.mock('prx:default-account', {});
    auth.mock('prx:series', {}).mockItems('prx:stories', []);
    auth.mockItems('prx:stories', []);
    series = new SeriesModel(null, new MockHalDoc({id: 99, count: () => 1}));
  });

  cit('displays standalone stories', (fix, el, comp) => {
    comp.noseries = true;
    comp.auth = auth;
    comp.account = account;
    fix.detectChanges();
    expect(el).toContainText('Your Standalone Episodes');
  });

  describe('Series', () => {

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
  })

});
