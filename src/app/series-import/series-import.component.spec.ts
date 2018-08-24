import { cit, create, cms, provide, stubPipe, By } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportComponent } from './series-import.component';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

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
  });

  cit('defaults new podcast import to the default account', (fix, el, comp) => {
    activatedRoute.testParams = {};
    auth.mock();
    fix.detectChanges();
    expect(comp.seriesImport.parent.id).toEqual(88);
  });

})
