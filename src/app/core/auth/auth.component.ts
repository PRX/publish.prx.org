import { Component, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { AuthService } from './auth.service';
import { AuthUrls } from './auth.urls';

@Component({
  selector: 'publish-auth',
  styles: ['iframe { display: none; }'],
  template: `<iframe [src]="authUrl" (load)="checkAuth()"></iframe>`
})

export class AuthComponent implements OnDestroy {

  authUrl: SafeResourceUrl;
  private sub: Subscription;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.sub = authService.refresh.subscribe(() => this.generateAuthUrl());
    this.generateAuthUrl();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  generateAuthUrl() {
    let url = AuthUrls.buildUrl('none');
    this.authUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
