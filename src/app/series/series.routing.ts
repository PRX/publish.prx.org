import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared';

import { SeriesComponent } from './series.component';
import { SeriesBasicComponent } from './directives/series-basic.component';
import { SeriesTemplatesComponent } from './directives/series-templates.component';
import { SeriesPodcastComponent } from './directives/series-podcast.component';
import { SeriesFeedComponent } from './directives/series-feed.component';
import { FileTemplateComponent } from './directives/file-template.component';

const seriesChildRoutes = [
  { path: '',          component: SeriesBasicComponent },
  { path: 'templates', component: SeriesTemplatesComponent },
  { path: 'podcast',   component: SeriesPodcastComponent },
  { path: 'list',   component: SeriesFeedComponent }
];

export const seriesRoutes: Routes = [
  {
    path: 'series/new',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    children: seriesChildRoutes
  },
  {
    path: 'series/:id',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    children: seriesChildRoutes
  }
];

export const seriesComponents: any[] = [
  SeriesComponent,
  SeriesBasicComponent,
  SeriesTemplatesComponent,
  SeriesPodcastComponent,
  SeriesFeedComponent,
  FileTemplateComponent
];

export const seriesProviders: any[] = [];

export const seriesRouting: ModuleWithProviders = RouterModule.forChild(seriesRoutes);
