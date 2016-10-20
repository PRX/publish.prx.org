import { cit, create, stubPipe, By } from '../../../testing';
import { AudioUploadComponent } from './audio-upload.component';

describe('AudioUploadComponent', () => {

  create(AudioUploadComponent);

  stubPipe('capitalize');

  const version = (isValid: any = true, isChanged = false) => {
    return {invalid: () => isValid, changed: () => isChanged};
  };

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
    comp.story = {versions: [version(), version()]};
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-audio-version')).length).toEqual(2);
  });

  cit('shows a helpful message if you have no versions', (fix, el, comp) => {
    comp.story = {versions: []};
    fix.detectChanges();
    expect(el).toContainText('You have no audio versions for this story');
  });

  cit('displays invalid status', (fix, el, comp) => {
    comp.story = {versions: [version(true, true)]};
    fix.detectChanges();
    expect(el).toQuery('.version.invalid.changed');
  });

  cit('displays invalid messages', (fix, el, comp) => {
    comp.story = {versions: [version('some message')]};
    fix.detectChanges();
    expect(el).toContainText('some message');
  });

});
