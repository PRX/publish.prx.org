import { Component } from '@angular/core';

@Component({
  selector: 'publish-prompt',
  template: `
  <div *ngIf="visible" class="overlay"></div>
  <div class="modal" tabindex="-1"
       [ngStyle]="{'display': visible ? 'flex' : 'none', 'opacity': visibleAnimate ? 1 : 0}">
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
  private visibleAnimate = false;

  public show(): void {
    this.visible = true;
    this.visibleAnimate = true;
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }
}
