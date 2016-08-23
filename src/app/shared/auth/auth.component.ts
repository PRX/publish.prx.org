import { Component, ElementRef } from '@angular/core';
import { DomSanitizationService, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService } from './auth.service';
import { AuthUrls } from './auth.urls';

@Component({
  selector: 'prx-auth',
  styles: ['iframe { display: none; }'],
  template: `<iframe [src]="authUrl" (load)="checkAuth()"></iframe>`
})

export class AuthComponent {

  private authUrl: SafeResourceUrl;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private sanitationService: DomSanitizationService
  ) {
    let url = AuthUrls.buildUrl('none');
    this.authUrl = sanitationService.bypassSecurityTrustResourceUrl(url);
  }

  checkAuth() {
    let query = AuthUrls.parseIframeQuery(this.element);

    // 1st load has no query, 2nd redirect-load does
    if (query) {
      let token = AuthUrls.parseToken(query);
      this.authService.setToken(token);
    }
  }

}
