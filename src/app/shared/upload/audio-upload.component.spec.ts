import { cit, create, By } from '../../../testing';
import { AudioUploadComponent } from './audio-upload.component';

describe('AudioUploadComponent', () => {

  create(AudioUploadComponent);

  cit('waits for the story versions', (fix, el, comp) => {
    expect(el).toQuery('publish-spinner');
    comp.story = {};
    fix.detectChanges();
    expect(el).toQuery('publish-spinner');
    comp.story.versions = [];
    fix.detectChanges();
    expect(el).not.toQuery('publish-spinner');
  });

  cit('renders the versions', (fix, el, comp) => {
    comp.story = {versions: ['foo', 'bar']};
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-audio-version')).length).toEqual(2);
  });

  cit('shows a helpful message if you have no versions', (fix, el, comp) => {
    comp.story = {versions: []};
    fix.detectChanges();
    expect(el).toContainText('You have no audio versions for this story');
  });

});
