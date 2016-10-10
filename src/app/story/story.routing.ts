import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from '../shared';

import { StoryComponent }       from './story.component';
import { StoryHeroComponent }   from './directives/hero.component';
import { EditComponent }        from './directives/edit.component';
import { DecorateComponent }    from './directives/decorate.component';
import { SellComponent }        from './directives/sell.component';

const storyChildRoutes = [
  { path: '',         component: EditComponent },
  { path: 'decorate', component: DecorateComponent },
  { path: 'sell',     component: SellComponent }
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
    path: 'story/new/:series_id',
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
  EditComponent,
  DecorateComponent,
  SellComponent
];

export const storyProviders: any[] = [];

export const storyRouting: ModuleWithProviders = RouterModule.forChild(storyRoutes);
