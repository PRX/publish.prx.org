import { Subject } from 'rxjs';
import { Angulartics2 } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { cit, create, provide, By } from '../testing';
import { AppComponent } from './app.component';

import { AuthService, ModalService, Userinfo, UserinfoService } from 'ngx-prx-styleguide';
import { CmsService } from './core/hal/cms.service';

let authToken = new Subject<string>();
let cmsToken: string = null;
let userinfo = new Userinfo();
userinfo.preferred_username = 'Someone';

describe('AppComponent', () => {

  create(AppComponent);

  provide(AuthService, {token: authToken});
  provide(CmsService, {
    setToken: token => cmsToken = token,
    account: new Subject<any>(),
    individualAccount: new Subject<any>()
  });
  provide(ModalService, {state: new Subject<boolean>()});
  provide(UserinfoService, {
    config: () => {},
    getUserinfo: userinfo
  });
  provide(Angulartics2, {
    filterDeveloperMode: () => () => new Subject<any>(),
    settings: {pageTracking: {}},
    trackLocation: () => {},
    pageTrack: new Subject<any>(),
    eventTrack: new Subject<any>(),
    exceptionTrack: new Subject<any>(),
    setUsername: new Subject<string>(),
    setUserProperties: new Subject<any>(),
    startTracking: () => {},
    userTimings: new Subject<any>()
  });
  provide(Angulartics2GoogleAnalytics);

  cit('only shows header link(s) when logged in', (fix, el, comp) => {
    comp.loggedIn = true;
    fix.detectChanges();
    expect(el.queryAll(By.css('prx-navitem')).length).toEqual(1);
    comp.loggedIn = false;
    fix.detectChanges();
    expect(el).not.toQuery('prx-navitem');
  });

  cit('shows user info when logged in', (fix, el, comp) => {
    comp.loggedIn = true;
    fix.detectChanges();
    expect(el).toQuery('prx-navuser');
    comp.loggedIn = false;
    fix.detectChanges();
    expect(el).not.toQuery('prx-navuser');
  });

});
