import { cit, create, provide, By } from '../../../testing';
import { SeriesBasicComponent } from './series-basic.component';
import { TabService } from '../../shared';

describe('SeriesBasicComponent', () => {

  create(SeriesBasicComponent);

  provide(TabService);

  cit('shows the basic series edit fields', (fix, el, comp) => {
    expect(el).not.toQuery('publish-fancy-field');
    comp.series = {};
    fix.detectChanges();

    expect(el.queryAll(By.css('publish-fancy-field')).length).toEqual(3);
    expect(el).toContainText('short headline');
    expect(el).toContainText('first impression');
    expect(el).toContainText('longer version');
  });

});
