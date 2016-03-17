import {Component, ElementRef} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {AuthService} from './auth.service';

@Component({
  directives: [RouterLink],
  selector: 'nav-login',
  styleUrls: [
    'app/header/navitem.component.css',
    'app/auth/navlogin.component.css'
  ],
  template: `
    <div class="nav-holder">
      <a [routerLink]="['Login']">Login</a>
    </div>
    <iframe src="{{authUrl}}" (load)="checkAuthIframe()"></iframe>
    `
})

export class NavLoginComponent {

  private authUrl: string;
  private iframe: Element;

  constructor(private element: ElementRef) {
    var host = 'https://id.prx.org';
    var id = 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D'; // localhost:3000/callback
    var nonce = this.getNonce();
    this.authUrl = `${host}/authorize?client_id=${id}&nonce=${nonce}&response_type=token&prompt=none`;
  }

  public checkAuthIframe(authService: AuthService): void {
    var iframe = this.element.nativeElement.getElementsByTagName('iframe')[0];
    var query = iframe.contentDocument.location.hash.replace(/^#/, '');

    // 1st load has no query, 2nd redirect-load does
    if (query) {
      var token = this.parseQuery(query)['access_token'];
      if (token) {
        console.log("YOU ARE logged in", token);
        authService.setToken(token);
      }
      else {
        console.log('You are logged OUT', query);
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
