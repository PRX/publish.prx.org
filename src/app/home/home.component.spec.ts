import { setupComponent, buildComponent, mockCms } from '../../test-support';
import { HomeComponent } from './home.component';

xdescribe('HomeComponent', () => {

  setupComponent(HomeComponent);

  let auth;
  beforeEach(() => {
    auth = mockCms.mock('prx:authorization', {});
    auth.mockItems('prx:series', []);
    auth.mock('prx:default-account', {});
    auth.mockItems('prx:stories', []);
  });

  it('shows a loading spinner', buildComponent((fix, el, home) => {
    expect(el.querySelector('spinner')).toBeNull();
    home.isLoaded = false;
    fix.detectChanges();
    expect(el.querySelector('spinner')).not.toBeNull();
  }));

  it('shows an empty no-series indicator', buildComponent((fix, el, home) => {
    expect(el.textContent).not.toMatch('View All');
    expect(el.textContent).toMatch('No Series');
    expect(el.querySelector('home-series')).not.toBeNull();
    expect(el.querySelector('home-series').getAttribute('noseries')).toEqual('true');
    expect(el.querySelector('home-series').getAttribute('rows')).toEqual('4');
  }));

  describe('with many series', () => {

    beforeEach(() => auth.mockItems('prx:series', [{}, {}, {}]));

    it('shows a list of series', buildComponent((fix, el, home) => {
      expect(el.textContent).toMatch('View All 3');
      let series = el.querySelectorAll('home-series');
      expect(series.length).toEqual(4);
      expect(series[0].getAttribute('rows')).toEqual('2');
      expect(series[0].getAttribute('noseries')).toBeNull();
      expect(series[3].getAttribute('rows')).toEqual('2');
      expect(series[3].getAttribute('noseries')).toEqual('true');
    }));

  });

  describe('with a single series', () => {

    beforeEach(() => auth.mockItems('prx:series', [{}]));

    it('shows many rows of a single series', buildComponent((fix, el, home) => {
      expect(el.textContent).not.toMatch('View All');
      let series = el.querySelectorAll('home-series');
      expect(series.length).toEqual(2);
      expect(series[0].getAttribute('rows')).toEqual('4');
      expect(series[0].getAttribute('noseries')).toBeNull();
      expect(series[1].getAttribute('rows')).toEqual('4');
      expect(series[1].getAttribute('noseries')).toEqual('true');
    }));

  });

});
