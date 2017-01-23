import { Component } from '@angular/core';

@Component({
  selector: 'publish-advanced-section',
  template: `
    <section>
      <ng-content *ngIf="show"></ng-content>
      <h3>
        <button class="btn-link" (click)="toggleShow()">
          <i [class.icon-right-dir]="!show" [class.icon-up-dir]="show"></i>{{show ? 'Hide' : 'Show'}} Advanced Settings
        </button>
      </h3>
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
