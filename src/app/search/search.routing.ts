import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared';

import { SearchComponent } from './search.component';
import { SearchStoryComponent } from './directives/search-story.component';
import { StoryListComponent } from './directives/story-list.component';
import { StoryCardComponent } from './directives/story-card.component';
import { SearchSeriesComponent } from './directives/search-series.component';
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
  SearchStoryComponent,
  StoryListComponent,
  StoryCardComponent,
  SearchSeriesComponent,
  SeriesListComponent,
  SeriesCardComponent
];

export const searchProviders: any[] = [];

export const searchRouting: ModuleWithProviders = RouterModule.forChild(searchRoutes);
