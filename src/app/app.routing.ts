import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from './shared';
import { HomeComponent, HomeSeriesComponent, HomeStoryComponent } from './home';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '',      component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] }
];

export const routingComponents: any[] = [
  HomeComponent,
  HomeSeriesComponent,
  HomeStoryComponent,
  LoginComponent
];

export const routingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
