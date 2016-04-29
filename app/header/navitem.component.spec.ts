import {it, describe, expect} from 'angular2/testing';
import {mockRouter, setupComponent, buildComponent} from '../../util/test-helper';
import {NavItemComponent} from './navitem.component';

describe('NavItemComponent', () => {

  setupComponent(NavItemComponent);

  mockRouter();

  it('renders a routed nav link', buildComponent((fix, el, navitem) => {
    navitem.text = 'Foobar';
    navitem.route = 'Home';
    fix.detectChanges();
    expect(el.querySelector('a')).toHaveText('Foobar');
    expect(el.querySelector('a').getAttribute('href')).toEqual('/home');
  }));

  it('renders an arbitrary url', buildComponent((fix, el, navitem) => {
    navitem.text = 'Somewhere';
    navitem.href = 'http://some.where';
    fix.detectChanges();
    expect(el.querySelector('a')).toHaveText('Somewhere');
    expect(el.querySelector('a').getAttribute('href')).toEqual('http://some.where');
  }));

});
