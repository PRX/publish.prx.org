import { cit, create, cms, By } from '../../testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  create(DashboardComponent);

  let auth;
  beforeEach(() => {
    auth = cms().mock('prx:authorization', {});
    auth.mockItems('prx:series', []);
    auth.mock('prx:default-account', {});
    auth.mockItems('prx:stories', []);
  });

  cit('shows a loading spinner', (fix, el, comp) => {
    comp.isLoaded = false;
    fix.detectChanges();
    expect(el).toQuery('prx-spinner');
  });

  cit('shows an empty no-series indicator', (fix, el, comp) => {
    expect(el).not.toContainText('View All');
    expect(el).toContainText('You have no series');
    expect(el).toQuery('.empty');
    expect(el).toQuery('.new-series');
    expect(el).toQuery('publish-dashboard-series');
    expect(el).toQueryAttr('publish-dashboard-series', 'noseries', 'true');
  });

  describe('with one or more series', () => {
    beforeEach(() => auth.mockItems('prx:series', [{}, {}, {}]));

    cit('shows a list of series', (fix, el, comp) => {
      fix.detectChanges();
      expect(el).toContainText('View All 3');
      let series = el.queryAll(By.css('publish-dashboard-series'));
      expect(series.length).toEqual(4); // 1 + standalone series
      expect(series[0].nativeElement.getAttribute('noseries')).toBeNull();
      expect(series[3].nativeElement.getAttribute('noseries')).toEqual('true');
    });
  });
});
