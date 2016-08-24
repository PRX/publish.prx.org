import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from './shared';
import { HomeComponent }          from './home/home.component';
import { LoginComponent }         from './login/login.component';
import { storyRoutes }            from './story';

export const routes: Routes = [
  { path: '',      component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] },
  ...storyRoutes
];

export const routing = RouterModule.forRoot(routes);
