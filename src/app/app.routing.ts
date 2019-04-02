import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from 'ngx-prx-styleguide';
import { ErrorComponent } from './error';
import { AuthorizationComponent } from './authorization/authorization.component';
import { HomeComponent, HomeSeriesComponent, HomeStoryComponent } from './home';
import { DashboardComponent, DashboardSeriesComponent, DashboardStoryComponent } from './dashboard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '_error_',   component: ErrorComponent },
  { path: 'permission-denied', component: AuthorizationComponent },
  { path: '',          component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent,  canActivate: [AuthGuard] },
  { path: 'login',     component: LoginComponent, canActivate: [UnauthGuard] }
];

export const routingComponents: any[] = [
  ErrorComponent,
  HomeComponent,
  HomeSeriesComponent,
  HomeStoryComponent,
  DashboardComponent,
  DashboardSeriesComponent,
  DashboardStoryComponent,
  LoginComponent,
  AuthorizationComponent
];

export const routingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
