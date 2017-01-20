import { Component } from '@angular/core';

@Component({
  selector: 'publish-advanced-section',
  template: `
    <section>
    <ng-content *ngIf="show"></ng-content>
    <button class="btn-link" (click)="toggleShow()">
      <i [class.icon-plus]="!show" [class.icon-cancel]="show"></i>{{show ? 'Hide' : 'Show'}} Advanced Settings
    </button>
    </section>
  `/*,
  styleUrls: ['advanced-section.component.css']*/
})

export class AdvancedSectionComponent {
  show = false;

  toggleShow() {
    this.show = !this.show;
  }
}
