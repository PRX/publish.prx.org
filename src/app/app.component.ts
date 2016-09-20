import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { AuthComponent, AuthService, CmsService, ModalComponent } from './shared';

import { HeaderComponent } from './header/header.component';
import { NavItemComponent } from './header/navitem.component';
import { NavUserComponent } from './header/navuser.component';
import { FooterComponent } from './footer/footer.component';

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
  selector: 'publish-root',
  templateUrl: 'app.component.html'
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
