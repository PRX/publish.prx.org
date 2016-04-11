import {Component, ElementRef} from 'angular2/core';
import {AuthService} from './auth.service';
import {CmsService} from '../cms/cms.service';

@Component({
  selector: 'prx-auth',
  styles: ['iframe { display: none; }'],
  template: `
    <iframe [src]="authUrl" (load)="checkAuth()"></iframe>
    <ng-content *ngIf="isAuthorized" select="logged-in"></ng-content>
    <ng-content *ngIf="!isAuthorized" select="logged-out"></ng-content>
    `
})

export class AuthComponent {

  private authUrl: string;

  // Assume user is logged in, to start
  private isAuthorized: boolean = true;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private cmsService: CmsService
  ) {
    this.authUrl = this.authService.authUrl('none');
    cmsService.token.subscribe((token) => {
      this.isAuthorized = (token ? true : false);
    });
  }

  checkAuth() {
    let iframe = this.element.nativeElement.getElementsByTagName('iframe')[0];
    let query = iframe.contentDocument.location.hash.replace(/^#/, '');

    // 1st load has no query, 2nd redirect-load does
    if (query) {
      let token = this.authService.parseToken(query);

      // Only alert cms service if logged in - otherwise it can wait forever
      if (token) {
        this.cmsService.token = token;
        this.isAuthorized = true;
      } else {
        this.isAuthorized = false;
      }
    }
  }

}
