import { cit, create, provide } from '../../../testing';
import { EditComponent } from './basic.component';
import { TabService } from '../../shared';

describe('BasicComponent', () => {

  create(BasicComponent);

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
