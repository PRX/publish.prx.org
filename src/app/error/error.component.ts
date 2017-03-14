import { Component } from '@angular/core';

@Component({
  selector: 'publish-error',
  styleUrls: ['error.component.css'],
  template: `
    <div class="error">
      <h1>Error Testing</h1>
      <p>Click a button to produce an error</p>
      <div><button (click)="runtimeError()">Runtime error</button></div>
    </div>
    `
})

export class ErrorComponent {

  runtimeError() {
    this['nothing']['this-should-fail']();
  }

}
