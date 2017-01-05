import { cit, create, cms, provide, stubPipe, By } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../core';
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
    prompt: (p) => modalAlertTitle = p
  });

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    modalAlertTitle = null;
  });

  cit('loads a series by id', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth.mock('prx:series', {id: 99, title: 'my series title'});
    fix.detectChanges();
    expect(el).toContainText('my series title');
    expect(comp.series.id).toEqual(99);
  });

  cit('creates new series from the default account', (fix, el, comp) => {
    activatedRoute.testParams = {};
    auth.mock('prx:default-account', {id: 88});
    fix.detectChanges();
    expect(comp.series.parent.id).toEqual(88);
  });

  cit('refuses to edit v3 series', (fix, el, comp) => {
    activatedRoute.testParams = {id: '99'};
    auth.mock('prx:series', {appVersion: 'v3'});
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
    auth.mock('prx:series', {appVersion: 'v4'}).mockItems('prx:stories', []);
    fix.detectChanges();

    let btn = el.queryAll(By.css('button')).find(e => {
      return e.nativeElement.textContent === 'Delete';
    });
    expect(btn).not.toBeUndefined();

    expect(modalAlertTitle).toBeNull();
    btn.triggerEventHandler('click', null);
    expect(modalAlertTitle).toEqual('Really delete?');
  });

});
