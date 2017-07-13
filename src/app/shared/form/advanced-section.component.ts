import { Component } from '@angular/core';

@Component({
  selector: 'publish-advanced-section',
  template: `
    <section>
      <hr *ngIf="show">
      <ng-content *ngIf="show"></ng-content>
      <button class="btn-link" (click)="toggleShow()">
        <i [class.icon-right-dir]="!show" [class.icon-up-dir]="show" aria-hidden="true"></i>{{show ? 'Hide' : 'Show'}} Advanced Settings
      </button>
    </section>
  `,
  styleUrls: ['advanced-section.component.css']
})

export class AdvancedSectionComponent {
  show = false;

  toggleShow() {
    this.show = !this.show;
  }
}
