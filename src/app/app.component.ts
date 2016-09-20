import { Component } from '@angular/core';

import { AuthService, CmsService } from './shared';

@Component({
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
