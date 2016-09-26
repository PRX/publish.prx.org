import { cit, create } from '../../../test-support';
import { NavItemComponent } from './navitem.component';

describe('NavItemComponent', () => {

  create(NavItemComponent);

  cit('renders a routed nav link', (fix, el, comp) => {
    comp.text = 'Foobar';
    comp.route = '/home';
    fix.detectChanges();
    expect(el).toQueryText('a', 'Foobar');
    expect(el).toQueryAttr('a', 'href', '/home');
  });

  cit('renders an arbitrary url', (fix, el, comp) => {
    comp.text = 'Somewhere';
    comp.href = 'http://some.where';
    fix.detectChanges();
    expect(el).toQueryText('a', 'Somewhere');
    expect(el).toQueryAttr('a', 'href', 'http://some.where');
  });

});
