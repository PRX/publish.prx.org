import {it, describe, expect} from '@angular/core/testing';
import {mockCms, mockDirective, setupComponent, buildCmsComponent} from '../../util/test-helper';
import {MockHalDoc} from '../shared/cms/cms.mocks';
import {HomeComponent} from './home.component';
import {HomeSeriesComponent} from './directives/home-series.component';

describe('HomeComponent', () => {

  mockCms();

  mockDirective(HomeSeriesComponent, {selector: 'home-series', template: '<i>s</i>'});

  let auth: MockHalDoc;
  setupComponent(HomeComponent, (cms) => {
    auth = cms.mock('prx:authorization', {});
    auth.mockItems('prx:series', []);
  });

  it('shows a loading spinner', buildCmsComponent((fix, el, home) => {
    fix.detectChanges();
    expect(el.querySelector('spinner')).toBeNull();
    home.isLoaded = false;
    fix.detectChanges();
    expect(el.querySelector('spinner')).not.toBeNull();
  }));

  it('shows an empty no-series indicator', buildCmsComponent((fix, el, home) => {
    fix.detectChanges();
    expect(el.textContent).not.toMatch('View All');
    expect(el.textContent).toMatch('No Series');
    expect(el.querySelector('home-series')).not.toBeNull();
    expect(el.querySelector('home-series').getAttribute('noseries')).toEqual('true');
    expect(el.querySelector('home-series').getAttribute('rows')).toEqual('4');
  }));

  it('shows a list of series', buildCmsComponent((fix, el, home) => {
    auth.mockItems('prx:series', [{}, {},{}]);
    fix.detectChanges();
    expect(el.textContent).toMatch('View All 3');
    let series = el.querySelectorAll('home-series');
    expect(series.length).toEqual(4);
    expect(series[0].getAttribute('rows')).toEqual('2');
    expect(series[0].getAttribute('noseries')).toBeNull();
    expect(series[3].getAttribute('rows')).toEqual('2');
    expect(series[3].getAttribute('noseries')).toEqual('true');
  }));

  it('shows many rows of a single series', buildCmsComponent((fix, el, home) => {
    auth.mockItems('prx:series', [{}]);
    fix.detectChanges();
    expect(el.textContent).not.toMatch('View All');
    let series = el.querySelectorAll('home-series');
    expect(series.length).toEqual(2);
    expect(series[0].getAttribute('rows')).toEqual('4');
    expect(series[0].getAttribute('noseries')).toBeNull();
    expect(series[1].getAttribute('rows')).toEqual('4');
    expect(series[1].getAttribute('noseries')).toEqual('true');
  }));

});
