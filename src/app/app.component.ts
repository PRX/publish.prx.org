import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { AuthService, CmsService, HalDoc } from './core';

@Component({
  selector: 'publish-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {

  loggedIn = true; // until proven otherwise
  userName: string;
  userImageDoc: HalDoc;

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

    cmsService.individualAccount.subscribe(doc => {
      this.userImageDoc = doc;
      this.userName = doc['name'];
    });
  }

}
