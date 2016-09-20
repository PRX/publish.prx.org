import { Routes } from '@angular/router';
import { AuthGuard } from '../shared';

import { SeriesComponent } from './series.component';
import { ButtonComponent, FancyFieldComponent, HeroComponent } from '../shared';

export const seriesComponents: any[] = [
  SeriesComponent,
  HeroComponent,
  ButtonComponent,
  FancyFieldComponent
];

export const seriesRoutes: Routes = [
  {
    path: 'series/create',
    component: SeriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'series/:id',
    component: SeriesComponent,
    canActivate: [AuthGuard]
  }
];
