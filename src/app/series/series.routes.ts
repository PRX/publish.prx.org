import { Routes } from '@angular/router';
import { AuthGuard, DeactivateGuard } from '../shared';

import { SeriesComponent } from './series.component';

export const seriesRoutes: Routes = [
  {
    path: 'series/create',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    // canDeactivate: [DeactivateGuard]
  },
  {
    path: 'series/:id',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    // canDeactivate: [DeactivateGuard]
  }
];
