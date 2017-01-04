import { cit, create, By, stubPipe } from '../../../testing';
import { MockHalDoc } from '../../../testing/mock.haldoc';
import { WysiwygComponent } from './wysiwyg.component';
import { StoryModel } from '../model/story.model';

describe('WysiwygComponent', () => {

  create(WysiwygComponent, false);

  stubPipe('capitalize');

  cit('shows markdown formatted as html', (fix, el, comp) => {
    let initialState = {descriptionMd: '**bold text**'};
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new MockHalDoc(initialState, undefined), false);
    comp.content = comp.model[comp.name];
    comp.images = [];
    fix.detectChanges();
    expect(el.query(By.css('strong'))).toBeDefined();
    expect(el).toContainText('bold text');
  });

  cit('doesn\'t add empty links', (fix, el, comp) => {
    let initialState = {descriptionMd: 'initial state'};
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new MockHalDoc(initialState, undefined), false);
    comp.content = comp.model[comp.name];
    comp.images = [];
    fix.detectChanges();
    comp.linkURL = '';
    comp.createLink();
    expect(comp.model[comp.name]).toEqual(initialState.descriptionMd);
  });
});
