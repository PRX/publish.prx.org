import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { AuthService, Userinfo, UserinfoService } from 'ngx-prx-styleguide';
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
  authorized = false; // until proven otherwise, to avoid nav "jump"
  userName: string;
  userImageDoc: HalDoc;
  userinfo: Userinfo;

  constructor(
    private auth: AuthService,
    private cms: CmsService,
    private user: UserinfoService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics
  ) {
    auth.token.subscribe(token => this.loadAccount(token));
    this.user.config(this.authHost);
  }

  loadAccount(token: string) {
    if (token) {
      this.user.getUserinfo().subscribe(userinfo => this.loadUserinfo(userinfo));

      this.loggedIn = true;
      if (!this.auth.parseToken(token)) {
        this.authorized = false;
      } else {
        this.authorized = true;
      }
    } else {
      this.loggedIn = false;
      this.authorized = false;
      this.userImageDoc = null;
      this.userName = null;
    }
  }

  loadUserinfo(userinfo: Userinfo) {
    this.userinfo = userinfo;
    this.user.getUserDoc(userinfo).subscribe(userDoc => {
      this.userImageDoc = userDoc;
    });
  }

}
