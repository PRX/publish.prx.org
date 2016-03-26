import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';

import {AuthComponent} from './shared/auth/auth.component';
import {HeaderComponent}  from './header/header.component';
import {NavItemComponent} from './header/navitem.component';
import {NavUserComponent} from './header/navuser.component';
import {FooterComponent}  from './footer/footer.component';
import {LoginComponent} from './login/login.component';

import {HomeComponent} from './home/home.component';
import {UploadComponent} from './upload/upload.component';

@Component({
  directives: [
    RouterOutlet,
    AuthComponent,
    HeaderComponent,
    NavItemComponent,
    NavUserComponent,
    FooterComponent,
    LoginComponent
  ],
  selector: 'publish-app',
  encapsulation: ViewEncapsulation.None, // important!
  styleUrls: [
    'app/app.component.reset.css',
    'app/app.component.css',
    'app/app.component.forms.css',
    'app/app.component.layout.css',
    'app/app.component.loading.css'
  ],
  template: `
    <prx-auth>
      <logged-in>
        <publish-header>
          <nav-item route="Home" text="Home"></nav-item>
          <nav-item href="//www.prx.org/search/all" text="Search"></nav-item>
          <nav-user></nav-user>
        </publish-header>
        <main>
          <router-outlet></router-outlet>
        </main>
        <publish-footer></publish-footer>
      </logged-in>
      <logged-out>
        <publish-header></publish-header>
        <main><publish-login></publish-login></main>
        <publish-footer></publish-footer>
      </logged-out>
    </prx-auth>
    `
})

@RouteConfig([
  { path: '/',       name: 'Index',  component: HomeComponent, useAsDefault: true },
  { path: '/home',   name: 'Home',   component: HomeComponent },
  { path: '/upload', name: 'Upload', component: UploadComponent }
])

export class AppComponent {}
