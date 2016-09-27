import { cit, create, cms, By } from '../../testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {

  create(HomeComponent);

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mockItems('prx:series', []);
    auth.mock('prx:default-account', {});
    auth.mockItems('prx:stories', []);
  });

  cit('shows a loading spinner', (fix, el, comp) => {
    expect(el).not.toQuery('publish-spinner');
    comp.isLoaded = false;
    fix.detectChanges();
    expect(el).toQuery('publish-spinner');
  });

  cit('shows an empty no-series indicator', (fix, el, comp) => {
    expect(el).not.toContainText('View All');
    expect(el).toContainText('You have no series');
    expect(el).toQuery('publish-home-series');
    expect(el).toQueryAttr('publish-home-series', 'noseries', 'true');
    expect(el).toQueryAttr('publish-home-series', 'rows', '4');
  });

  describe('with many series', () => {

    beforeEach(() => auth.mockItems('prx:series', [{}, {}, {}]));

    cit('shows a list of series', (fix, el, comp) => {
      expect(el).toContainText('View All 3');
      let series = el.queryAll(By.css('publish-home-series'));
      expect(series.length).toEqual(4);
      expect(series[0].nativeElement.getAttribute('rows')).toEqual('2');
      expect(series[0].nativeElement.getAttribute('noseries')).toBeNull();
      expect(series[3].nativeElement.getAttribute('rows')).toEqual('2');
      expect(series[3].nativeElement.getAttribute('noseries')).toEqual('true');
    });

  });

  describe('with a single series', () => {

    beforeEach(() => auth.mockItems('prx:series', [{}]));

    cit('shows many rows of a single series', (fix, el, comp) => {
      expect(el).toContainText('View All 1');
      let series = el.queryAll(By.css('publish-home-series'));
      expect(series.length).toEqual(2);
      expect(series[0].nativeElement.getAttribute('rows')).toEqual('4');
      expect(series[0].nativeElement.getAttribute('noseries')).toBeNull();
      expect(series[1].nativeElement.getAttribute('rows')).toEqual('4');
      expect(series[1].nativeElement.getAttribute('noseries')).toEqual('true');
    });

  });

});
