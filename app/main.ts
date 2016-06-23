import 'reflect-metadata';
import 'zone.js';
import 'core-js';
import 'rxjs/Rx';

import {enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {HTTP_PROVIDERS} from '@angular/http';
import {disableDeprecatedForms, provideForms} from '@angular/forms';

import {AuthService} from './shared/auth/auth.service';
import {CmsService} from './shared/cms/cms.service';
import {MimeTypeService} from '../util/mime-type.service';
import {ModalService} from './shared/modal/modal.service';
import {UploadService} from './upload/services/upload.service';

if (!window.location.hostname.match(/localhost|\.dev|\.docker/)) {
  enableProdMode();
}

import {AppComponent} from './app.component';

bootstrap(AppComponent, [
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  disableDeprecatedForms(),
  provideForms(),
  AuthService,
  CmsService,
  MimeTypeService,
  ModalService,
  UploadService
]).catch((err: any) => console.error(err));
