import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared';

import { SeriesComponent } from './series.component';

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

export const seriesComponents: any[] = [
  SeriesComponent
];

export const seriesProviders: any[] = [];

export const seriesRouting: ModuleWithProviders = RouterModule.forChild(seriesRoutes);
