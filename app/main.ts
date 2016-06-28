import 'core-js';
import 'reflect-metadata';
import 'zone.js';
import 'rxjs/Rx';

import {enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';
import {disableDeprecatedForms, provideForms} from '@angular/forms';

import {AuthGuard, UnauthGuard, DeactivateGuard} from './shared/auth/auth.guard';
import {AuthService} from './shared/auth/auth.service';
import {CmsService} from './shared/cms/cms.service';
import {MimeTypeService} from '../util/mime-type.service';
import {ModalService} from './shared/modal/modal.service';
import {UploadService} from './upload/services/upload.service';

if (!window.location.hostname.match(/localhost|\.dev|\.docker/)) {
  enableProdMode();
}

import {AppComponent} from './app.component';
import {APP_ROUTER_PROVIDERS} from './app.routes';

bootstrap(AppComponent, [
  APP_ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  disableDeprecatedForms(),
  provideForms(),
  AuthGuard,
  AuthService,
  CmsService,
  DeactivateGuard,
  MimeTypeService,
  ModalService,
  UnauthGuard,
  UploadService
]).catch((err: any) => console.error(err));
