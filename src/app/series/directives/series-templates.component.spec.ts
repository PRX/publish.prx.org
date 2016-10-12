import { cit, create, provide } from '../../../testing';
import { SeriesTemplatesComponent } from './series-templates.component';
import { TabService } from '../../shared';

describe('SeriesTemplatesComponent', () => {

  create(SeriesTemplatesComponent);

  provide(TabService);

  cit('renders', (fix, el, comp) => {
    expect(el).toContainText('These are some templates');
  });

});
