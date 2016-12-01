import { Selection } from 'prosemirror-state';
import { cit, create, By } from '../../../testing';
import { WysiwygComponent } from './wysiwyg.component';
import { StoryModel } from '../model/story.model';
import { HalDoc } from '../../core/cms/haldoc';

describe('WysiwygComponent', () => {

  create(WysiwygComponent, false);

  cit('shows markdown formatted as html', (fix, el, comp) => {
    comp.name = 'description';
    comp.model = {description: '**bold text**'};
    fix.detectChanges();
    expect(el.query(By.css('strong'))).toBeDefined();
    expect(el).toContainText('bold text');
  });

  cit('adds image option once images have been loaded', (fix, el, comp) => {
    comp.name = 'description';
    comp.model = {description: ''};
    spyOn(comp, 'insertImageItem');
    comp.images = [{filename: 'TestImage.jpg'}];
    fix.detectChanges();
    expect(comp.insertImageItem).toHaveBeenCalled();
  });

  cit('doesn\'t add empty links', (fix, el, comp) => {
    let initialState = 'initial state';
    comp.name = 'description';
    comp.model = {description: initialState};
    fix.detectChanges();
    comp.linkURL = '';
    comp.createLink();
    expect(comp.model[comp.name]).toEqual(initialState);
  });
});
