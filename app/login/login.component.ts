import {Component, ElementRef} from '@angular/core';
import {DomSanitizationService, SafeResourceUrl} from '@angular/platform-browser';
import {AuthService} from '../shared/auth/auth.service';
import {CmsService} from '../shared/cms/cms.service';

@Component({
  selector: 'publish-login',
  styleUrls: ['app/login/login.component.css'],
  template: `
    <div class="login">
      <h1>Login</h1>
      <p *ngIf="!errorMsg">You must login to use this app</p>
      <p *ngIf="errorMsg" class="error">{{errorMsg}}</p>
      <iframe [src]="iframeUrl" (load)="checkLogin()"></iframe>
    </div>
    `
})

export class LoginComponent {

  private iframeUrl: SafeResourceUrl;
  private errorMsg: string;
  private firstLoad: boolean = false;

  constructor(
    private element: ElementRef,
    private authService: AuthService,
    private cmsService: CmsService,
    private sanitationService: DomSanitizationService
  ) {
    let url = this.authService.authUrl('login');
    this.iframeUrl = sanitationService.bypassSecurityTrustResourceUrl(url);
  }

  checkLogin() {
    let iframe = this.element.nativeElement.getElementsByTagName('iframe')[0];

    // until the iframe successfully logs in and redirects, we're just going
    // to get errors trying to access the cross-origin frame
    try {
      let query = iframe.contentDocument.location.hash.replace(/^#/, '');
      if (query) {
        let token = this.authService.parseToken(query);
        if (token) {
          this.cmsService.setToken(token);
        }
      }
    } catch (e) {
      if (this.firstLoad) {
        this.errorMsg = 'Invalid username or password';
      }
      this.firstLoad = true;
    }
  }

}
