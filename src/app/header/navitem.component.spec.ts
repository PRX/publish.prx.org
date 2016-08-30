import { setupComponent, buildComponent } from '../../test-support';
import { NavItemComponent } from './navitem.component';

describe('NavItemComponent', () => {

  setupComponent(NavItemComponent);

  it('renders a routed nav link', buildComponent((fix, el, navitem) => {
    navitem.text = 'Foobar';
    navitem.route = '/home';
    fix.detectChanges();
    expect(el.querySelector('a').textContent).toEqual('Foobar');
    expect(el.querySelector('a').getAttribute('href')).toEqual('/home');
  }));

  it('renders an arbitrary url', buildComponent((fix, el, navitem) => {
    navitem.text = 'Somewhere';
    navitem.href = 'http://some.where';
    fix.detectChanges();
    expect(el.querySelector('a').textContent).toEqual('Somewhere');
    expect(el.querySelector('a').getAttribute('href')).toEqual('http://some.where');
  }));

});
