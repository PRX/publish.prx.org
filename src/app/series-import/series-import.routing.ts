import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { SeriesImportComponent } from './series-import.component';


export const seriesImportRoutes: Routes = [
  {
    path: 'series-import',
    component: SeriesImportComponent,
    //canActivate: [AuthGuard],
    //canDeactivate: [DeactivateGuard],
    children: []
  }
];

export const seriesImportComponents: any[] = [
  SeriesImportComponent,
];

export const seriesImportProviders: any[] = [];

export const seriesImportRouting: ModuleWithProviders = RouterModule.forChild(seriesImportRoutes);
