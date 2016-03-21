import {Component} from 'angular2/core';
import {RouterLink} from 'angular2/router';

import {CmsService} from '../shared/cms/cms.service';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {ImageLoaderComponent} from '../shared/image/image-loader.component';

@Component({
  directives: [RouterLink, SpinnerComponent, ImageLoaderComponent],
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
        <a *ngIf="!userName" [routerLink]="['Login']">Login</a>
        <a *ngIf="userName">
          <span class="name">{{userName}}</span>
          <image-loader [src]="userImage"></image-loader>
        </a>
      </template>
    </div>
    `
})

export class NavLoginComponent {

  private isLoading: boolean = true;
  private userName: string;
  private userImage: string;

  constructor(private cmsService: CmsService) {
    this.cmsService.follows('prx:authorization', 'prx:default-account').subscribe((doc) => {
      this.userName = doc['name'];
      this.isLoading = false;
    }, (err) => {
      this.userName = null;
      this.isLoading = false;
    });
    this.cmsService.follows('prx:authorization', 'prx:default-account', 'prx:image').subscribe((doc) => {
      this.userImage = doc ? doc.link('enclosure') : null;
    }, (err) => {
      this.userImage = null;
    });
  }

}
