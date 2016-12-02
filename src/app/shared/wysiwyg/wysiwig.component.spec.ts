import { cit, create, By, stubPipe } from '../../../testing';
import { WysiwygComponent } from './wysiwyg.component';
import { StoryModel } from '../model/story.model';
import { HalDoc } from '../../core/cms/haldoc';

describe('WysiwygComponent', () => {

  create(WysiwygComponent, false);

  stubPipe('capitalize');

  cit('shows markdown formatted as html', (fix, el, comp) => {
    let initialState = '**bold text**';
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new HalDoc({description: initialState}), false);
    fix.detectChanges();
    expect(el.query(By.css('strong'))).toBeDefined();
    expect(el).toContainText('bold text');
  });

  cit('adds image option once images have been loaded', (fix, el, comp) => {
    let initialState = '';
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new HalDoc({description: initialState}), false);
    spyOn(comp, 'insertImageItem');
    comp.images = [{filename: 'TestImage.jpg'}];
    fix.detectChanges();
    expect(comp.insertImageItem).toHaveBeenCalled();
  });

  cit('doesn\'t add empty links', (fix, el, comp) => {
    let initialState = 'initial state';
    comp.name = 'description';
    comp.model = new StoryModel(undefined, new HalDoc({description: initialState}), false);
    fix.detectChanges();
    comp.linkURL = '';
    comp.createLink();
    expect(comp.model[comp.name]).toEqual(initialState);
  });
});
