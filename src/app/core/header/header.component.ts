import { Component } from '@angular/core';

@Component({
  selector: 'publish-header',
  styleUrls: ['header.component.css'],
  template: `
    <header>
      <div class="contents">
        <h1><a [routerLink]="['/']">PRX</a></h1>
        <nav>
          <ng-content></ng-content>
        </nav>
      </div>
    </header>
    `
})

export class HeaderComponent {}
