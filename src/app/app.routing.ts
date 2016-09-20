import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard, DeactivateGuard } from './shared';
import { HomeComponent, HomeSeriesComponent, HomeStoryComponent } from './home';
import { LoginComponent } from './login/login.component';

import { seriesRoutes, seriesComponents } from './series';
import { storyRoutes, storyComponents } from './story';

export const routes: Routes = [
  { path: '',      component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] },
  ...seriesRoutes,
  ...storyRoutes
];

export const routingComponents: any[] = [
  HomeComponent,
  HomeSeriesComponent,
  HomeStoryComponent,
  LoginComponent,
  ...seriesComponents,
  ...storyComponents
];

export const routingProviders: any[] = [
  AuthGuard,
  UnauthGuard,
  DeactivateGuard
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
