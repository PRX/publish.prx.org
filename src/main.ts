import {enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';

import 'rxjs/Rx';

if (window.location.host !== 'localhost') {
  enableProdMode();
}

import {App} from './app/app';

bootstrap(App, [ROUTER_PROVIDERS, HTTP_BINDINGS]);
