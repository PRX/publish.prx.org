import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { StoryComponent } from './story.component';
import { StoryHeroComponent } from './directives/hero.component';
import { BasicComponent } from './directives/basic.component';
import { PodcastComponent } from './directives/podcast.component';
import { PlayerComponent } from './directives/player.component';
import { StoryStatusComponent } from './directives/status.component';

const storyChildRoutes = [
  { path: '',        component: BasicComponent },
  { path: 'podcast', component: PodcastComponent },
  { path: 'player',  component: PlayerComponent },
];

export const storyRoutes: Routes = [
  {
    path: 'story/new',
    component: StoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: storyChildRoutes
  },
  {
    path: 'story/new/:seriesId',
    component: StoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: storyChildRoutes
  },
  {
    path: 'story/:id',
    component: StoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: storyChildRoutes
  }
];

export const storyComponents: any[] = [
  StoryComponent,
  StoryHeroComponent,
  BasicComponent,
  PodcastComponent,
  PlayerComponent,
  StoryStatusComponent
];

export const storyProviders: any[] = [];

export const storyRouting: ModuleWithProviders = RouterModule.forChild(storyRoutes);
