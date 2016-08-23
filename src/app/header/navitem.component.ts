import { Component, Input } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  directives: [ROUTER_DIRECTIVES],
  selector: 'nav-item',
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
