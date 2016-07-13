import {it, describe, expect} from '@angular/core/testing';
import {setupComponent, mockDirective, mockRouter, mockService,
  buildComponent} from '../util/test-helper';
import {Subject} from 'rxjs';

import {AppComponent} from './app.component';
import {AuthComponent}    from './shared/auth/auth.component';
import {ModalComponent}   from './shared/modal/modal.component';
import {NavItemComponent} from './header/navitem.component';
import {NavUserComponent} from './header/navuser.component';

import {AuthService} from './shared/auth/auth.service';
import {CmsService} from './shared/cms/cms.service';
import {ModalService} from './shared/modal/modal.service';

let authToken = new Subject<string>();
let cmsToken: string = null;

describe('AppComponent', () => {

  mockDirective(AuthComponent,    {selector: 'prx-auth',       template: '<i>auth</i>'});
  mockDirective(ModalComponent,   {selector: 'modal-box',      template: '<i>modal</i>'});
  mockDirective(NavItemComponent, {selector: 'nav-item',       template: '<i>navitem</i>'});
  mockDirective(NavUserComponent, {selector: 'nav-user',       template: '<i>navuser</i>'});

  mockRouter();

  mockService(AuthService, {token: authToken});
  mockService(CmsService, {setToken: (token: any) => { cmsToken = token; } });
  mockService(ModalService, {});

  setupComponent(AppComponent);

  it('only shows header links when logged in', buildComponent((fix, el, app) => {
    app.loggedIn = true;
    fix.detectChanges();
    expect(el.querySelectorAll('nav-item').length).toEqual(3);
    app.loggedIn = false;
    fix.detectChanges();
    expect(el.querySelectorAll('nav-item').length).toEqual(0);
  }));

  it('ties together auth and cms', buildComponent((fix, el, app) => {
    expect(cmsToken).toBeNull();
    authToken.next('something');
    expect(cmsToken).toEqual('something');
  }));

});
