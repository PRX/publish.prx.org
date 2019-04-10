import { cit, create, cms, provide } from '../../../testing';
import { RouterStub, ActivatedRouteStub } from '../../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService, MockHalDoc } from 'ngx-prx-styleguide';
import { SeriesModel } from '../../shared';
import { ProductionCalendarComponent } from './production-calendar.component';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

class MockHalHttpError extends Error {
  name = 'HalHttpError';
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

describe('ProductionCalendarComponent', () => {

  create(ProductionCalendarComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);

  let toastErrorMsg: string;
  provide(ToastrService, { success: () => {}, error: (msg) => toastErrorMsg = msg });

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:series', {id: 99, title: 'my series title'});
    auth.mock('prx:default-account', {});
    auth.mockItems('prx:stories', []);
  });

  cit('loads a series by id', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth.mock('prx:series', {id: 99, title: 'my series title'});
    fix.detectChanges();
    expect(el).toContainText('my series title');
    expect(comp.series.id).toEqual(99);
  });

  cit('pops error if series does not exist', (fix, el, comp) => {
    auth.mockError('prx:series', new MockHalHttpError(404, 'No series found.'));
    comp.id = 100;
    comp.loadSeries();
    expect(toastErrorMsg).toEqual('No series found. Redirecting to home page.');
  });

  cit('provides a link to the series', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth.mock('prx:series', {id: 99, title: 'my series title'});
    fix.detectChanges();
    expect(el).toQueryAttr('.hero section > a', 'href', '/series/99');
  });
});
