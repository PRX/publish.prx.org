import { Component } from '@angular/core';
import { setupComponent, buildComponent } from '../../test-support';
import { HeaderComponent } from './header.component';

@Component({
  directives: [HeaderComponent],
  template: '<publish-header><h4>Something</h4></publish-header>'
})
class MiniComponent {}

describe('HeaderComponent', () => {

  setupComponent(MiniComponent);

  it('renders a home logo link', buildComponent((fix, el, mini) => {
    expect(el.querySelector('h1').textContent).toEqual('PRX');
  }));

  it('includes ng content', buildComponent((fix, el, mini) => {
    expect(el.querySelector('nav h4').textContent).toEqual('Something');
  }));

});
