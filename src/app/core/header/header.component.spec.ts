import { cit, contain } from '../../../test-support';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {

  contain(HeaderComponent, {
    template: '<publish-header><h4>Something</h4></publish-header>'
  });

  cit('renders a home logo link', (fix, el, comp) => {
    expect(el).toQueryText('h1', 'PRX');
  });

  cit('includes ng content', (fix, el, comp) => {
    expect(el).toQueryText('h4', 'Something');
  });

});
