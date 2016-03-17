import {Component, ElementRef} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {AuthService, PrxAuthUser} from './auth.service';
import {SpinnerComponent} from '../shared/spinner/spinner.component';

@Component({
  directives: [RouterLink, SpinnerComponent],
  selector: 'nav-login',
  styleUrls: [
    'app/header/navitem.component.css',
    'app/auth/navlogin.component.css'
  ],
  template: `
    <div class="nav-holder">
      <div *ngIf="isLoading" class="spin-holder">
        <spinner [spinning]="isLoading" inverse=true></spinner>
      </div>
      <template [ngIf]="!isLoading">
        <a *ngIf="!authUser" [routerLink]="['Login']">Login</a>
        <a *ngIf="authUser">
          <span class="name">{{authUser.name}}</span>
          <img src="//placehold.it/150x150"/>
        </a>
      </template>
    </div>
    <iframe src="{{authUrl}}" (load)="checkAuthIframe()"></iframe>
    `
    //
})

export class NavLoginComponent {

  private authUrl: string;
  private iframe: Element;
  private isLoading: boolean = true;
  private authUser: PrxAuthUser;

  constructor(private element: ElementRef, private authService: AuthService) {
    this.authService.user.subscribe(this.authChanged);

    var host = 'https://id.prx.org';
    var id = 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D'; // localhost:3000/callback
    var nonce = this.getNonce();
    this.authUrl = `${host}/authorize?client_id=${id}&nonce=${nonce}&response_type=token&prompt=none`;
  }

  authChanged = (user:PrxAuthUser) => {
    this.isLoading = false;
    this.authUser = user;
  }

  public checkAuthIframe(): void {
    var iframe = this.element.nativeElement.getElementsByTagName('iframe')[0];
    var query = iframe.contentDocument.location.hash.replace(/^#/, '');

    // 1st load has no query, 2nd redirect-load does
    if (query) {
      var token = this.parseQuery(query)['access_token'];
      if (token) {
        this.authService.setToken(token);
      }
      else {
        this.authService.setToken(null);
      }
    }
  }

  private getNonce(): string {
    var nonce:string[] = [];
    for (var i = 0; i < 8; i++) {
      nonce.push(this.randomInt(0, 15).toString(16));
    }
    return nonce.join('');
  }

  private randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }

  private parseQuery(query: string = ''): Object {
    var data = {};
    for (var pair of query.split('&')) {
      var parts = pair.split('=');
      data[parts[0]] = parts[1];
    }
    return data;
  }

}
