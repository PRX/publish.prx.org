import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from 'ngx-prx-styleguide';
import { ErrorComponent } from './error';
import { HomeComponent, HomeSeriesComponent, HomeStoryComponent } from './home';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '_error_',   component: ErrorComponent },
  { path: '',          component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'login',     component: LoginComponent, canActivate: [UnauthGuard] }
];

export const routingComponents: any[] = [
  ErrorComponent,
  HomeComponent,
  HomeSeriesComponent,
  HomeStoryComponent,
  LoginComponent
];

export const routingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
