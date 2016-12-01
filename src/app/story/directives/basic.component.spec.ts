import { cit, create, provide, By } from '../../../testing';
import { BasicComponent } from './basic.component';
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

  cit('shows the basic story edit fields', (fix, el, comp) => {
    expect(el).not.toQuery('publish-fancy-field');
    expect(el).not.toQuery('publish-wysiwyg');
    comp.story = {images: []};
    fix.detectChanges();

    expect(el.queryAll(By.css('publish-fancy-field')).length).toEqual(5);
    expect(el.queryAll(By.css('publish-wysiwyg')).length).toEqual(1);
    expect(el).toContainText('newspaper headline');
    expect(el).toContainText('first impression');
    expect(el).toContainText('full description');
    expect(el).toContainText('list of tags');
  });

  cit('shows warning if no audio versions', (fix, el, comp) => {
    comp.story = {versions: []};
    fix.detectChanges();

    expect(el).toContainText('You have no audio versions for this story');
  });

});
