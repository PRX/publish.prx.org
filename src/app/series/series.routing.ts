import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared';

import { SeriesComponent } from './series.component';
import { SeriesBasicComponent } from './directives/series-basic.component';
import { SeriesImageComponent } from './directives/series-image.component';
import { SeriesTemplatesComponent } from './directives/series-templates.component';
import { SeriesAdvancedComponent } from './directives/series-advanced.component';

export const seriesRoutes: Routes = [
  {
    path: 'series/:id',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',          component: SeriesBasicComponent },
      { path: 'image',     component: SeriesImageComponent },
      { path: 'templates', component: SeriesTemplatesComponent },
      { path: 'advanced',  component: SeriesAdvancedComponent }
    ]
  },
  {
    path: 'series/new',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',          component: SeriesBasicComponent },
      { path: 'image',     component: SeriesImageComponent },
      { path: 'templates', component: SeriesTemplatesComponent },
      { path: 'advanced',  component: SeriesAdvancedComponent }
    ]
  }
];

export const seriesComponents: any[] = [
  SeriesComponent,
  SeriesBasicComponent,
  SeriesImageComponent,
  SeriesTemplatesComponent,
  SeriesAdvancedComponent
];

export const seriesProviders: any[] = [];

export const seriesRouting: ModuleWithProviders = RouterModule.forChild(seriesRoutes);
