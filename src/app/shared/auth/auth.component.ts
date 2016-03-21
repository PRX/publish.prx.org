import {Component, ElementRef} from 'angular2/core';
import {CmsService} from '../cms/cms.service';

@Component({
  selector: 'prx-auth',
  styles: [':host { display: none; }'],
  template: `<iframe [src]="authUrl" (load)="checkAuth()"></iframe>`
})

export class AuthComponent {

  private authUrl: string;
  private iframe: Element;

  constructor(private element: ElementRef, private cmsService: CmsService) {
    let host = 'https://id.prx.org';
    let id = 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D'; // localhost:3000/callback
    let nonce = this.getNonce();
    this.authUrl = `${host}/authorize?client_id=${id}&nonce=${nonce}&response_type=token&prompt=none`;
  }

  checkAuth() {
    var iframe = this.element.nativeElement.getElementsByTagName('iframe')[0];
    var query = iframe.contentDocument.location.hash.replace(/^#/, '');

    // 1st load has no query, 2nd redirect-load does
    if (query) {
      var token = this.parseQuery(query)['access_token'];
      if (token) {
        this.cmsService.token = token;
      }
      else {
        this.cmsService.token = null;
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
