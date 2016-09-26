import { cit, create, provide } from '../../../test-support';
import { EditComponent } from './edit.component';
import { StoryTabService } from '../services/story-tab.service';

describe('EditComponent', () => {

  create(EditComponent);

  provide(StoryTabService);

  cit('does not render until the story is loaded', (fix, el, edit) => {
    edit.story = null;
    fix.detectChanges();
    expect(el).not.toQuery('form');
    edit.story = {};
    fix.detectChanges();
    expect(el).toQuery('form');
  });

});
