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
  authorized = true; // until proven otherwise
  userName: string;
  userImageDoc: HalDoc;

  constructor(
    private auth: AuthService,
    private cms: CmsService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics
  ) {
    auth.token.subscribe(token => this.loadAccount(token));
  }

  loadAccount(token: string) {
    if (token) {
      if (token === 'AUTHORIZATION_FAIL') {
        this.loggedIn = true;
        this.authorized = false;
      } else {
        this.loggedIn = true;
        this.authorized = true;
        this.cms.individualAccount.subscribe(doc => {
          this.userImageDoc = doc;
          this.userName = doc['name'];
        });
      }
    } else {
      this.loggedIn = false;
      this.authorized = false;
      this.userImageDoc = null;
      this.userName = null;
    }
  }

}
