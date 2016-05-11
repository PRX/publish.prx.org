import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent, mockService} from '../../util/test-helper';
import {Location} from 'angular2/src/router/location/location';
import {FooterComponent} from './footer.component';

describe('FooterComponent', () => {

  setupComponent(FooterComponent);

  mockService(Location, {
    path(): string {
      return '/foobar';
    }
  });

  it('renders the footer', buildComponent((fix, el, footer) => {
    fix.detectChanges();
    expect(el.textContent).toMatch(`You're seeing a beta preview of prx.org`);
  }));

  it('uses the path in the old version link', buildComponent((fix, el, footer) => {
    fix.detectChanges();
    let old = el.querySelector('a.old-version');
    expect(old).toHaveText('Use Old Version');
    expect(old.getAttribute('href')).toMatch('http://www.prx.org/foobar');
  }));

});
