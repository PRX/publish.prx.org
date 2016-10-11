import { cit, create, provide } from '../../../testing';
import { EditComponent } from './edit.component';
import { TabService } from '../../shared';

describe('EditComponent', () => {

  create(EditComponent);

  provide(TabService);

  cit('does not render until the story is loaded', (fix, el, edit) => {
    edit.story = null;
    fix.detectChanges();
    expect(el).not.toQuery('form');
    edit.story = {};
    fix.detectChanges();
    expect(el).toQuery('form');
  });

});
