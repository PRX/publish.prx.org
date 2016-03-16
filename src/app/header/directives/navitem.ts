import {Component, Input} from 'angular2/core';
import {RouterLink} from 'angular2/router';

@Component({
  directives: [RouterLink],
  selector: 'nav-item',
  styleUrls: ['app/header/directives/navitem.css'],
  template: `
    <div class="nav-holder">
      <a *ngIf="route"  [routerLink]="[route]">{{text}}</a>
      <a *ngIf="!route" [href]="href">{{text}}</a>
    </div>
    `
})

export class NavItem {
  @Input() route: string;
  @Input() href:  string;
  @Input() text:  string;
}
