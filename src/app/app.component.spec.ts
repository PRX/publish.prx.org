import { Subject } from 'rxjs';
import { cit, create, provide } from '../test-support';
import { AppComponent } from './app.component';

import { AuthService } from './core/auth/auth.service';
import { CmsService } from './core/cms/cms.service';
import { ModalService } from './core/modal/modal.service';

let authToken = new Subject<string>();
let cmsToken: string = null;

describe('AppComponent', () => {

  create(AppComponent);

  provide(AuthService, {token: authToken});
  provide(CmsService, {
    setToken: token => cmsToken = token,
    account: new Subject<any>()
  });
  provide(ModalService, {state: new Subject<boolean>()});

  cit('only shows header links when logged in', (fix, el, comp) => {
    comp.loggedIn = true;
    fix.detectChanges();
    expect(el).toQuery('publish-navitem');
    comp.loggedIn = false;
    fix.detectChanges();
    expect(el).not.toQuery('publish-navitem');
  });

  cit('ties together auth and cms', (fix, el, comp) => {
    expect(cmsToken).toBeNull();
    authToken.next('something');
    expect(cmsToken).toEqual('something');
  });

});
