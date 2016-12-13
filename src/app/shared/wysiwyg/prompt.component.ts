import { Component } from '@angular/core';

@Component({
  selector: 'publish-prompt',
  template: `
  <div *ngIf="visible" class="overlay"></div>
  <div *ngIf="visible" class="modal" tabindex="-1">
    <header>
      <ng-content select=".modal-header"></ng-content>
    </header>
    <section>
      <ng-content select=".modal-body"></ng-content>
    </section>
    <footer>
      <ng-content select=".modal-footer"></ng-content>
    </footer>
  </div>
  `,
  styleUrls: ['prompt.component.css']
})
export class PromptComponent {

  public visible = false;

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }
}
