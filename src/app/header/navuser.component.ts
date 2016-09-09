import { Component } from '@angular/core';
import { ImageLoaderComponent, SpinnerComponent } from '../shared';
import { CmsService } from '../shared/cms/cms.service';
import { HalDoc } from '../shared/cms/haldoc';

@Component({
  directives: [SpinnerComponent, ImageLoaderComponent],
  selector: 'nav-user',
  styleUrls: [
    'navitem.component.css',
    'navuser.component.css'
  ],
  template: `
    <div class="nav-holder">
      <template [ngIf]="userName">
        <a *ngIf="userName">
          <span class="name">{{userName}}</span>
          <image-loader [imageDoc]="userImageDoc"></image-loader>
        </a>
      </template>
      <div *ngIf="!userName" class="spin-holder">
        <publish-spinner inverse=true></publish-spinner>
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
