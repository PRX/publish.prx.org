import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router-deprecated';

@Component({
  directives: [RouterLink],
  selector: 'nav-item',
  styleUrls: ['app/header/navitem.component.css'],
  template: `
    <div class="nav-holder">
      <a *ngIf="route"  [routerLink]="[route]">{{text}}</a>
      <a *ngIf="!route" [href]="href">{{text}}</a>
    </div>
    `
})

export class NavItemComponent {
  @Input() route: string;
  @Input() href: string;
  @Input() text: string;
}
