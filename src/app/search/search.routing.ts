import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'ngx-prx-styleguide';

import { SearchComponent } from './search.component';
import { SearchStoryFormComponent } from './directives/search-story-form.component';
import { StoryListComponent } from './directives/story-list.component';
import { StoryCardComponent } from './directives/story-card.component';
import { SearchSeriesFormComponent } from './directives/search-series-form.component';
import { SeriesListComponent } from './directives/series-list.component';
import { SeriesCardComponent } from './directives/series-card.component';

export const searchRoutes: Routes = [
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard]
  }
];

export const searchComponents: any[] = [
  SearchComponent,
  SearchStoryFormComponent,
  StoryListComponent,
  StoryCardComponent,
  SearchSeriesFormComponent,
  SeriesListComponent,
  SeriesCardComponent
];

export const searchProviders: any[] = [];

export const searchRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(searchRoutes);
