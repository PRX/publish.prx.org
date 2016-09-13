import { Subject } from 'rxjs';
import { setupComponent, buildComponent, mockService } from '../test-support';
import { AppComponent } from './app.component';

import { AuthService } from './shared/auth/auth.service';
import { CmsService } from './shared/cms/cms.service';
import { ModalService } from './shared/modal/modal.service';

let authToken = new Subject<string>();
let cmsToken: string = null;

describe('AppComponent', () => {

  setupComponent(AppComponent);

  mockService(AuthService, {token: authToken});
  mockService(CmsService, {
    setToken: token => cmsToken = token,
    account: new Subject<any>()
  });
  mockService(ModalService, {state: new Subject<boolean>()});

  it('only shows header links when logged in', buildComponent((fix, el, app) => {
    app.loggedIn = true;
    fix.detectChanges();
    expect(el.querySelectorAll('nav-item').length).toEqual(2);
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
