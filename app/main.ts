import 'angular2/bundles/angular2-polyfills';
import {enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';

import 'rxjs/Rx';

import {AuthService} from './shared/auth/auth.service';
import {CmsService} from './shared/cms/cms.service';

if (!window.location.hostname.match(/localhost|\.dev/)) {
  enableProdMode();
}

import {AppComponent} from './app.component';

bootstrap(AppComponent,
  [
    ROUTER_PROVIDERS,
    HTTP_BINDINGS,
    AuthService,
    CmsService
  ]);
