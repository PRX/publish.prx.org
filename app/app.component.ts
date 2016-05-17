import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';

import {AuthComponent} from './shared/auth/auth.component';
import {ModalComponent} from './shared/modal/modal.component';
import {HeaderComponent} from './header/header.component';
import {NavItemComponent} from './header/navitem.component';
import {NavUserComponent} from './header/navuser.component';
import {FooterComponent} from './footer/footer.component';
import {LoginComponent} from './login/login.component';

import {HomeComponent} from './home/home.component';
import {StoryEditComponent} from './storyedit/storyedit.component';

@Component({
  directives: [
    RouterOutlet,
    AuthComponent,
    HeaderComponent,
    ModalComponent,
    NavItemComponent,
    NavUserComponent,
    FooterComponent,
    LoginComponent
  ],
  selector: 'publish-app',
  encapsulation: ViewEncapsulation.None, // Important!
  styleUrls: [
    'app/app.component.reset.css',
    'app/app.component.css',
    'app/app.component.forms.css',
    'app/app.component.layout.css',
    'app/app.component.loading.css',
    'assets/fontello/css/fontello.css'
  ],
  template: `
    <prx-auth>
      <logged-in>
        <publish-header>
          <nav-item route="Home" text="Home"></nav-item>
          <nav-item route="Create" text="Create"></nav-item>
          <nav-item href="//www.prx.org/search/all" text="Search"></nav-item>
          <nav-user></nav-user>
        </publish-header>
        <main>
          <article>
            <router-outlet></router-outlet>
          </article>
        </main>
        <publish-footer></publish-footer>
      </logged-in>
      <logged-out>
        <publish-header></publish-header>
        <main><publish-login></publish-login></main>
        <publish-footer></publish-footer>
      </logged-out>
    </prx-auth>
    <modal-box></modal-box>
    `
})

@RouteConfig([
  { path: '/',             name: 'Index',  component: HomeComponent, useAsDefault: true },
  { path: '/home',         name: 'Home',   component: HomeComponent },
  { path: '/create/...',   name: 'Create', component: StoryEditComponent },
  { path: '/edit/:id/...', name: 'Edit',   component: StoryEditComponent }
])

export class AppComponent {}
