import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';

import {Header}  from './header/header';
import {NavItem} from './header/directives/navitem';
import {Footer}  from './footer/footer';

import {Home} from './home/home';

@Component({
  directives: [RouterOutlet, Header, NavItem, Footer],
  selector: 'publish-app',
  encapsulation: ViewEncapsulation.None, // important!
  styleUrls: [
    'app/app.reset.css',
    'app/app.css',
    'app/app.forms.css',
    'app/app.layout.css',
    'app/app.loading.css'
  ],
  template: `
    <publish-header>
      <nav-item route="Home" text="Home"></nav-item>
      <nav-item href="//www.prx.org/search/all" text="Search"></nav-item>
    </publish-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <publish-footer></publish-footer>
    `
})

@RouteConfig([
  { path: '/',      name: 'Index', component: Home, useAsDefault: true },
  { path: '/home',  name: 'Home',  component: Home }
])

export class App {}
