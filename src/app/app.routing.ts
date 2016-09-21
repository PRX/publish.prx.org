import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from './shared';
import { HomeComponent, HomeSeriesComponent, HomeStoryComponent } from './home';
import { LoginComponent } from './login/login.component';

// import { seriesRoutes, seriesComponents, seriesProviders } from './series';
// import { storyRoutes, storyComponents, storyProviders } from './story';

export const routes: Routes = [
  { path: '',      component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] },
  // ...seriesRoutes,
  // ...storyRoutes
];

export const routingComponents: any[] = [
  HomeComponent,
  HomeSeriesComponent,
  HomeStoryComponent,
  LoginComponent,
  // ...seriesComponents,
  // ...storyComponents
];

export const routingProviders: any[] = [
  // ...seriesProviders,
  // ...storyProviders
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
