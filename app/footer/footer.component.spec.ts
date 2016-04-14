import {it, describe, expect, beforeEachProviders} from 'angular2/testing';
import {setupComponent, buildComponent} from '../../util/test-helper';
import {provide} from 'angular2/core';
import {Location} from 'angular2/src/router/location/location';
import {FooterComponent} from './footer.component';

class FakeLocation {
  path(): string {
    return '/foobar';
  }
}

describe('FooterComponent', () => {

  beforeEachProviders(() => [
    provide(Location, {useClass: FakeLocation})
  ]);

  setupComponent(FooterComponent);

  it('renders the footer', buildComponent((fix, el, footer) => {
    expect(el.textContent).toMatch(`You're seeing a beta preview of prx.org`);
  }));

  it('uses the path in the old version link', buildComponent((fix, el, footer) => {
    let old = el.querySelector('a.old-version');
    expect(old).toHaveText('Use Old Version');
    expect(old.getAttribute('href')).toMatch('http://www.prx.org/foobar');
  }));

});
