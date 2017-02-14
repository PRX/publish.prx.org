import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { AuthService, CmsService } from './core';

@Component({
  selector: 'publish-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {

  loggedIn: boolean = true; // until proven otherwise

  constructor(authService: AuthService, cmsService: CmsService,
              angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    authService.token.subscribe((token) => {
      if (token) {
        let refresher: any;
        cmsService.setToken(token, cb => {
          if (!refresher) {
            refresher = authService.refreshToken();
          }
          return refresher;
        });
      }
      this.loggedIn = token ? true : false;
    });
  }

}
