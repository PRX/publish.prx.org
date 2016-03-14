import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';

@Component({
  directives: [ROUTER_DIRECTIVES, HeaderComponent, FooterComponent],
  selector: 'publish-app',
  styleUrls: [
    'app/app.css',
    'app/app.forms.css',
    'app/app.layout.css',
    'app/app.loading.css'
  ],
  template: `
    <publish-header></publish-header>
    <main>
      <prx-loading-bar></prx-loading-bar>
      <router-outlet></router-outlet>
    </main>
    <publish-footer></publish-footer>
  `
})

@RouteConfig([
])

export class AppComponent { }
