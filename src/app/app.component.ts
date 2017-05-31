import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { AuthService } from 'ngx-prx-styleguide';
import { CmsService, HalDoc } from './core';
import { Env } from './core/core.env';

@Component({
  selector: 'publish-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {

  authHost = Env.AUTH_HOST;
  authClient = Env.AUTH_CLIENT_ID;

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
