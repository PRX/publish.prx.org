import {it, describe, expect, beforeEachProviders} from 'angular2/testing';
import {provideRouter, setupComponent, buildComponent} from '../../util/test-helper';
import {HeaderComponent} from './header.component';

import {Component} from 'angular2/core';
@Component({
  directives: [HeaderComponent],
  template: '<publish-header><h4>Something</h4></publish-header>'
})
class MiniContainer {}

describe('HeaderComponent', () => {

  beforeEachProviders(() => [
    provideRouter()
  ]);

  setupComponent(MiniContainer);

  it('renders a home logo link', buildComponent((fix, el, mini) => {
    expect(el.querySelector('h1')).toHaveText('PRX');
  }));

  it('includes ng content', buildComponent((fix, el, mini) => {
    expect(el.querySelector('nav h4')).toHaveText('Something');
  }));

});
