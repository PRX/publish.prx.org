import { setupComponent, buildComponent } from '../../test-support';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {

  setupComponent(FooterComponent);

  it('renders the footer', buildComponent((fix, el, footer) => {
    expect(el.textContent).toMatch(`You're seeing a beta preview of prx.org`);
  }));

  it('uses the path in the old version link', buildComponent((fix, el, footer) => {
    spyOn(footer, 'locationPath').and.returnValue('/foobar');
    fix.detectChanges();
    let old = el.querySelector('a.old-version');
    expect(old.textContent).toEqual('Use Old Version');
    expect(old.getAttribute('href')).toMatch('http://www.prx.org/foobar');
  }));

});