import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from 'ngx-prx-styleguide';
import { ErrorComponent } from './error';
import { AuthorizationComponent } from './authorization/authorization.component';
import * as dashboard from './dashboard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '_error_', component: ErrorComponent },
  { path: 'permission-denied', component: AuthorizationComponent },
  { path: '', component: dashboard.DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] }
];

export const routingComponents: any[] = [ErrorComponent, ...dashboard.components, LoginComponent, AuthorizationComponent];

export const routingProviders: any[] = [];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forRoot(routes);
