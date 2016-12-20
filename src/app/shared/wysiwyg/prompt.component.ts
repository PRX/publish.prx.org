import { Component } from '@angular/core';

@Component({
  selector: 'publish-prompt',
  template: `
  <div class="overlay"></div>
  <div class="modal" tabindex="-1">
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
export class PromptComponent {}
