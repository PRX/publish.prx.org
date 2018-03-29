import { Component } from '@angular/core';

@Component({
  selector: 'publish-authorization',
  styleUrls: ['authorization.component.css'],
  template: `
    <div class="error">
      <h1>Permission denied</h1>
      <p>Sorry, you don't have permission to use this application.</p>
    </div>
    `
})

export class AuthorizationComponent {

}
