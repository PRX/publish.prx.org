import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';

import {HeaderComponent}  from './header/header.component';
import {NavItemComponent} from './header/navitem.component';
import {FooterComponent}  from './footer/footer.component';

import {HomeComponent} from './home/home.component';

@Component({
  directives: [RouterOutlet, HeaderComponent, NavItemComponent, FooterComponent],
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
  { path: '/',      name: 'Index', component: HomeComponent, useAsDefault: true },
  { path: '/home',  name: 'Home',  component: HomeComponent }
])

export class AppComponent {}
