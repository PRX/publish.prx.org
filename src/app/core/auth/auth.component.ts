import { Component, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService } from './auth.service';
import { AuthUrls } from './auth.urls';

@Component({
  selector: 'publish-auth',
  styles: ['iframe { display: none; }'],
  template: `<iframe [src]="authUrl" (load)="checkAuth()"></iframe>`
})

export class AuthComponent {

  private authUrl: SafeResourceUrl;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    let url = AuthUrls.buildUrl('none');
    this.authUrl = sanitizer.bypassSecurityTrustResourceUrl(url);
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
