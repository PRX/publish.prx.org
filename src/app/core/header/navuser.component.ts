import { Component } from '@angular/core';
import { CmsService, HalDoc } from '../cms';

@Component({
  selector: 'publish-navuser',
  styleUrls: [
    'navitem.component.css',
    'navuser.component.css'
  ],
  template: `
    <div class="nav-holder">
      <template [ngIf]="userName">
        <a *ngIf="userName">
          <span class="name">{{userName}}</span>
          <ng-content select="user-loaded"></ng-content>
        </a>
      </template>
      <div *ngIf="!userName" class="spin-holder">
        <ng-content select="user-loading"></ng-content>
      </div>
    </div>
    `
})

export class NavUserComponent {

  userName: string;
  userImageDoc: HalDoc;

  constructor(private cms: CmsService) {
    cms.account.subscribe((doc) => {
      this.userName = doc['name'];
      this.userImageDoc = doc;
    });
  }

}
