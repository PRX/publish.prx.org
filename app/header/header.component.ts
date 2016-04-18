import {Component} from 'angular2/core';
import {RouterLink} from 'angular2/router';

@Component({
  directives: [RouterLink],
  selector: 'publish-header',
  styleUrls: ['app/header/header.component.css'],
  template: `
    <header>
      <div class="contents">
        <prx-drawer-button></prx-drawer-button>
        <h1><a [routerLink]="['Index']">PRX</a></h1>
        <nav>
          <ng-content></ng-content>
        </nav>
      </div>
    </header>
    `
})

export class HeaderComponent {}
