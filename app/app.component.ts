import {Component, ViewEncapsulation} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {AuthComponent} from './shared/auth/auth.component';
import {AuthService} from './shared/auth/auth.service';
import {CmsService} from './shared/cms/cms.service';
import {ModalComponent} from './shared/modal/modal.component';
import {HeaderComponent} from './header/header.component';
import {NavItemComponent} from './header/navitem.component';
import {NavUserComponent} from './header/navuser.component';
import {FooterComponent} from './footer/footer.component';

@Component({
  directives: [
    ROUTER_DIRECTIVES,
    AuthComponent,
    HeaderComponent,
    ModalComponent,
    NavItemComponent,
    NavUserComponent,
    FooterComponent
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
    <publish-header>
      <nav-item *ngIf="loggedIn" route="/" text="Home"></nav-item>
      <nav-item *ngIf="loggedIn" route="../create" text="Create"></nav-item>
      <nav-item *ngIf="loggedIn" href="//www.prx.org/search/all" text="Search"></nav-item>
      <nav-user *ngIf="loggedIn"></nav-user>
    </publish-header>
    <main>
      <article>
        <router-outlet></router-outlet>
      </article>
    </main>
    <publish-footer></publish-footer>
    <prx-auth></prx-auth>
    <modal-box></modal-box>
    `
})

export class AppComponent {

  loggedIn: boolean = true; // until proven otherwise

  constructor(authService: AuthService, cmsService: CmsService) {
    authService.token.subscribe((token) => {
      if (token) {
        cmsService.setToken(token);
      }
      this.loggedIn = token ? true : false;
    });
  }

}
