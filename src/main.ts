import 'reflect-metadata';
import 'angular2/bundles/angular2-polyfills';
import {enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';

import 'rxjs/Rx';

import {AuthService} from './app/shared/auth/auth.service';
import {CmsService} from './app/shared/cms/cms.service';

if (window.location.host !== 'localhost') {
  enableProdMode();
}

import {AppComponent} from './app/app.component';

bootstrap(AppComponent,
  [
    ROUTER_PROVIDERS,
    HTTP_BINDINGS,
    AuthService,
    CmsService
  ]);
