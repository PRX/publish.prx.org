import { Component, Input } from '@angular/core';

@Component({
  selector: 'publish-navitem',
  styleUrls: ['navitem.component.css'],
  template: `
    <div class="nav-holder">
      <a *ngIf="route" [routerLink]="[route]" routerLinkActive="active"
        [routerLinkActiveOptions]="{exact:true}">{{text}}</a>
      <a *ngIf="!route" [href]="href">{{text}}</a>
    </div>
    `
})

export class NavItemComponent {
  @Input() route: string;
  @Input() href: string;
  @Input() text: string;
}
