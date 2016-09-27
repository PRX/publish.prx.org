import { cit, create } from '../../../testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {

  create(FooterComponent);

  cit('renders the footer', (fix, el, comp) => {
    expect(el).toContainText(`You're seeing a beta preview of prx.org`);
  });

  cit('uses the path in the old version link', (fix, el, comp) => {
    spyOn(comp, 'locationPath').and.returnValue('/foobar');
    fix.detectChanges();
    expect(el).toQueryText('a.old-version', 'Use Old Version');
    expect(el).toQueryAttr('a.old-version', 'href', 'http://www.prx.org/foobar?m=false');
  });

});
