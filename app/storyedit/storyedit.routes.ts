import {RouterConfig} from '@angular/router';

import {AuthGuard}          from '../shared/auth/auth.guard';
import {StoryEditComponent} from './storyedit.component';
import {EditComponent}      from './directives/edit.component';
import {DecorateComponent}  from './directives/decorate.component';
import {SellComponent}      from './directives/sell.component';

export const storyEditRoutes: RouterConfig = [
  // {
  //   path: ':id',
  //   redirectTo: '/edit/:id',
  //   terminal: true
  // },
  {
    path: 'edit',
    component: StoryEditComponent,
    canActivate: [AuthGuard],
    children: [
      { path: ':id',          component: EditComponent },
      { path: ':id/decorate', component: DecorateComponent },
      { path: ':id/sell',     component: SellComponent }
    ]
  },
  {
    path: 'create',
    component: StoryEditComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',         component: EditComponent },
      { path: 'decorate', component: DecorateComponent },
      { path: 'sell',     component: SellComponent }
    ]
  }
];
