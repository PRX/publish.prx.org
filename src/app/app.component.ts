import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';

import {AuthComponent} from './shared/auth/auth.component';
import {HeaderComponent}  from './header/header.component';
import {NavItemComponent} from './header/navitem.component';
import {NavLoginComponent} from './auth/navlogin.component';
import {FooterComponent}  from './footer/footer.component';

import {HomeComponent}  from './home/home.component';
import {LoginComponent} from './auth/login.component';

@Component({
  directives: [
    RouterOutlet,
    AuthComponent,
    HeaderComponent,
    NavItemComponent,
    NavLoginComponent,
    FooterComponent
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
    <prx-auth></prx-auth>
    <publish-header>
      <nav-item route="Home" text="Home"></nav-item>
      <nav-item href="//www.prx.org/search/all" text="Search"></nav-item>
      <nav-login></nav-login>
    </publish-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <publish-footer></publish-footer>
    `
})

@RouteConfig([
  { path: '/',      name: 'Index', component: HomeComponent, useAsDefault: true },
  { path: '/home',  name: 'Home',  component: HomeComponent },
  { path: '/login', name: 'Login', component: LoginComponent }
])

export class AppComponent {}
