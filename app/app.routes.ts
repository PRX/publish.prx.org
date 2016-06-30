import {provideRouter, RouterConfig} from '@angular/router';

import {AuthGuard, UnauthGuard} from './shared/auth/auth.guard';
import {HomeComponent}          from './home/home.component';
import {LoginComponent}         from './login/login.component';
import {storyEditRoutes}        from './storyedit/storyedit.routes';

export const routes: RouterConfig = [
  { path: '',      component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] },
  ...storyEditRoutes
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
