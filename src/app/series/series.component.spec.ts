import { cit, create, cms, provide, stubPipe, By } from '../../testing';
import { MockHalHttpError } from '../../testing/mock.haldoc';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ModalService, ToastrService } from '../core';
import { SeriesComponent } from './series.component';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

describe('SeriesComponent', () => {

  create(SeriesComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);
  stubPipe('timeago');

  let modalAlertTitle: any;
  provide(ModalService, {
    alert: (a) => modalAlertTitle = a,
    confirm: (p) => modalAlertTitle = p
  });
  let mockToastr = { success: () => {}, error: () => {} };
  provide(ToastrService, mockToastr);

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    modalAlertTitle = null;
  });

  cit('loads a series by id', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth.mock('prx:series', {id: 99, title: 'my series title'}).mock('prx:account', {id: 78});
    fix.detectChanges();
    expect(el).toContainText('my series title');
    expect(comp.series.id).toEqual(99);
  });

  cit('redirects if series ID does not exist', (fix, el, comp) => {
    spyOn(auth, 'follow').and.callFake((params: any) => {
      return Observable.throw(new MockHalHttpError(404, 'Series does not exist.'));
    });
    spyOn(router, 'navigate').and.stub();
    spyOn(mockToastr, 'error').and.stub();
    auth.follow().subscribe((s) => fail('shouldnt have gotten'), (e) => console.log(e));

    activatedRoute.testParams = {id: '100'};
    // expect(auth.follow).toThrow('Series does not exist.');
    comp.loadSeries();
    expect(router.navigate).toHaveBeenCalled();
    expect(mockToastr.error).toHaveBeenCalled();
  });

  cit('defaults new series to the default account', (fix, el, comp) => {
    activatedRoute.testParams = {};
    auth.mock('prx:default-account', {id: 88});
    fix.detectChanges();
    expect(comp.series.parent.id).toEqual(88);
  });

  cit('refuses to edit v3 series', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth.mock('prx:series', {appVersion: 'v3'}).mock('prx:account', {id: 78});
    expect(modalAlertTitle).toBeNull();
    fix.detectChanges();
    expect(modalAlertTitle).toEqual('Cannot Edit Series');
  });

  cit('navigates to new series after save', (fix, el, comp) => {
    activatedRoute.testParams = {};
    auth.mock('prx:default-account', {id: 88});
    fix.detectChanges();

    let btn = el.queryAll(By.css('publish-button')).find(e => {
      return e.nativeElement.textContent === 'Create';
    });
    expect(btn).not.toBeNull();

    spyOn(router, 'navigate').and.stub();
    btn.triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalled();
  });

  cit('confirms deletion', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    let series = auth.mock('prx:series', {appVersion: 'v4'});
    series.mockItems('prx:stories', []);
    series.mock('prx:account', {id: 88});
    fix.detectChanges();

    let btn = el.queryAll(By.css('button')).find(e => {
      return e.nativeElement.textContent === 'Delete';
    });
    expect(btn).not.toBeUndefined();

    expect(modalAlertTitle).toBeNull();
    btn.nativeElement.click();
    expect(modalAlertTitle).toEqual('Really delete?');
  });

  cit('confirms discarding unsaved changes before leaving', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:series', {id: 99, title: 'my series title', appVersion: 'v4'}).mock('prx:account', {id: 78});
    fix.detectChanges();
    expect(comp.canDeactivate()).toEqual(true);
    spyOn(comp.series, 'changed').and.returnValue(true);
    expect(comp.canDeactivate() instanceof Observable).toBeTruthy();
    expect(modalAlertTitle).toMatch(/unsaved changes/i);
  });

  cit('does not confirm for unsaved changes after delete', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:series', {id: 99, title: 'my series title', appVersion: 'v4'}).mock('prx:account', {id: 78});
    fix.detectChanges();
    comp.series.isDestroy = true;
    expect(comp.canDeactivate()).toEqual(true);
    expect(modalAlertTitle).toBeNull();
  });

});
