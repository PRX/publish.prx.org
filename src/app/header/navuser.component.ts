import { Component } from '@angular/core';
import { CmsService, ImageLoaderComponent, SpinnerComponent } from '../shared';

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
          <image-loader [src]="userImage"></image-loader>
        </a>
      </template>
      <div *ngIf="!userName" class="spin-holder">
        <spinner inverse=true></spinner>
      </div>
    </div>
    `
})

export class NavUserComponent {

  userName: string;
  userImage: string;

  constructor(private cms: CmsService) {
    cms.account.subscribe((doc) => {
      this.userName = doc['name'];
      doc.follow('prx:image').subscribe(
        (image) => {
          this.userImage = image.expand('enclosure');
        },
        (err) => {
          this.userImage = null; // no image - leave blank
        }
      );
    });
  }

}
