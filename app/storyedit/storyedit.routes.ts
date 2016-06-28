import {RouterConfig} from '@angular/router';

import {AuthGuard, DeactivateGuard} from '../shared/auth/auth.guard';
import {StoryEditComponent}         from './storyedit.component';
import {EditComponent}              from './directives/edit.component';
import {DecorateComponent}          from './directives/decorate.component';
import {SellComponent}              from './directives/sell.component';

export const storyEditRoutes: RouterConfig = [
  {
    path: 'edit/:id',
    component: StoryEditComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [
      { path: '',         component: EditComponent },
      { path: 'decorate', component: DecorateComponent },
      { path: 'sell',     component: SellComponent }
    ]
  },
  {
    path: 'create',
    component: StoryEditComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [
      { path: '',         component: EditComponent },
      { path: 'decorate', component: DecorateComponent },
      { path: 'sell',     component: SellComponent }
    ]
  }
];
