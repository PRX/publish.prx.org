import {enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';

import 'rxjs/Rx';

import {AuthService} from './app/auth/auth.service';

if (window.location.host !== 'localhost') {
  enableProdMode();
}

import {AppComponent} from './app/app.component';

bootstrap(AppComponent,
  [
    ROUTER_PROVIDERS,
    HTTP_BINDINGS,
    AuthService
  ]);
