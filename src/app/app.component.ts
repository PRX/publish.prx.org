import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { UploadComponent } from './upload/upload.component';

@Component({
  selector: 'publish-app',
  template: '<router-outlet></router-outlet>',
  providers: [ROUTER_PROVIDERS],
  directives: [ROUTER_DIRECTIVES]
})

@RouteConfig([
  {
    path: '/upload',
    name: 'Upload',
    component: UploadComponent,
    useAsDefault: true
  }
])

export class AppComponent { }
