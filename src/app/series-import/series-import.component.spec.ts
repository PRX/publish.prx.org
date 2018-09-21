import { cit, create, cms, provide, stubPipe, By } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportComponent } from './series-import.component';
import { SeriesModel } from '../shared';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

class MockHalHttpError extends Error {
  name = 'HalHttpError';
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

describe('SeriesImportComponent', () => {

  create(SeriesImportComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);
  stubPipe('timeago');

  let modalAlertTitle: any;
  provide(ModalService, {
    alert: (a) => modalAlertTitle = a,
    confirm: (p) => modalAlertTitle = p
  });

  let toastErrorMsg: any;
  provide(ToastrService, { success: () => {}, error: (msg) => toastErrorMsg = msg });

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {id: 88});
    modalAlertTitle = null;
    auth.mock('prx:default-account', {id: 88});
  });

  cit('defaults new podcast import to the default account', (fix, el, comp) => {
    activatedRoute.testParams = {};
    fix.detectChanges();
    expect(comp.series.parent.id).toEqual(88);
  });

  cit('validates an invalid podcast rss', (fix, el, comp) => {
    activatedRoute.testParams = {};
    auth.mockError('prx:verify-rss', new MockHalHttpError(400, 'Invalid rss feed'));

    fix.detectChanges();

    comp.series.importUrl = "http://example.com/invalid.rss"
    expect(comp.series.parent.id).toEqual(88);

    comp.validateImportUrl();
    expect(toastErrorMsg).toEqual('The rss url is not valid.');
    expect(comp.importValidationState.valid()).toEqual(false);
  });

  cit('validates an valid podcast rss', (fix, el, comp) => {
    activatedRoute.testParams = {};
    auth.mock('prx:default-account', {id: 88});
    auth.mock('prx:verify-rss', {feed: {}});

    fix.detectChanges();

    comp.series.importUrl = "http://example.com/valid.rss"

    comp.validateImportUrl(()=>{});
    expect(comp.importValidationState.valid()).toEqual(true);
  });

})
