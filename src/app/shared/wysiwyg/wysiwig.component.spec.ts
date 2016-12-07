import { cit, create, By, stubPipe } from '../../../testing';
import { WysiwygComponent } from './wysiwyg.component';
import { StoryModel } from '../model/story.model';
import { HalDoc } from '../../core/cms/haldoc';

describe('WysiwygComponent', () => {

  create(WysiwygComponent, false);

  stubPipe('capitalize');

  cit('shows markdown formatted as html', (fix, el, comp) => {
    let initialState = {description: '**bold text**'};
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new HalDoc(initialState, undefined), false);
    comp.images = [];
    fix.detectChanges();
    expect(el.query(By.css('strong'))).toBeDefined();
    expect(el).toContainText('bold text');
  });

  cit('doesn\'t add empty links', (fix, el, comp) => {
    let initialState = {description: 'initial state'};
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new HalDoc(initialState, undefined), false);
    comp.images = [];
    fix.detectChanges();
    comp.linkURL = '';
    comp.createLink();
    expect(comp.model[comp.name]).toEqual(initialState.description);
  });
});
