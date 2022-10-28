import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { SeriesComponent } from './series.component';
import { SeriesBasicComponent } from './directives/series-basic.component';
import { SeriesTemplatesComponent } from './directives/series-templates.component';
import { SeriesPlanComponent } from './directives/series-plan.component';
import { SeriesPodcastComponent } from './directives/series-podcast.component';
import { SeriesFeedsComponent } from './directives/series-feeds.component';
import { SeriesFeedComponent } from './directives/series-feed.component';
import { SeriesEngagementComponent } from './directives/series-engagement.component';
import { SeriesImportStatusComponent } from './directives/series-import-status.component';
import { SeriesImportStatusCardComponent } from '../series-import-status-card/series-import-status-card.component';
import { FileTemplateComponent } from './directives/file-template.component';
import * as productionCalendar from './production-calendar/';

const seriesChildRoutes = [
  { path: '', component: SeriesBasicComponent },
  { path: 'templates', component: SeriesTemplatesComponent },
  { path: 'plan', component: SeriesPlanComponent },
  { path: 'podcast', component: SeriesPodcastComponent },
  { path: 'feeds', component: SeriesFeedsComponent },
  { path: 'list', component: SeriesFeedComponent },
  { path: 'engagement', component: SeriesEngagementComponent },
  { path: 'import-status', component: SeriesImportStatusComponent }
];

export const seriesRoutes: Routes = [
  {
    path: 'series/new',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: seriesChildRoutes
  },
  {
    path: 'series/:id',
    component: SeriesComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: seriesChildRoutes
  },
  {
    path: 'series/:id/calendar',
    component: productionCalendar.ProductionCalendarComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard]
  }
];

export const seriesComponents: any[] = [
  SeriesComponent,
  SeriesBasicComponent,
  SeriesTemplatesComponent,
  SeriesPlanComponent,
  SeriesPodcastComponent,
  SeriesFeedsComponent,
  SeriesFeedComponent,
  SeriesEngagementComponent,
  SeriesImportStatusComponent,
  SeriesImportStatusCardComponent,
  FileTemplateComponent,
  productionCalendar.ProductionCalendarComponent,
  productionCalendar.ProductionCalendarSeriesComponent,
  productionCalendar.ProductionCalendarStoryComponent
];

export const seriesProviders: any[] = [];

export const seriesRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(seriesRoutes);
