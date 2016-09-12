import { setupComponent, buildComponent, mockDirective } from '../../test-support';
import { AudioUploadComponent } from './audio-upload.component';
import { AudioVersionComponent } from './directives/audio-version.component';

xdescribe('AudioUploadComponent', () => {

  setupComponent(AudioUploadComponent);

  mockDirective(AudioVersionComponent, {selector: 'audio-version', template: '<i>version</i>'});

  it('waits for the story versions', buildComponent((fix, el, upload) => {
    fix.detectChanges();
    expect(el.querySelector('spinner')).not.toBeNull();
    upload.story = {};
    fix.detectChanges();
    expect(el.querySelector('spinner')).not.toBeNull();
    upload.story.versions = [];
    fix.detectChanges();
    expect(el.querySelector('spinner')).toBeNull();
  }));

  it('renders the versions', buildComponent((fix, el, upload) => {
    upload.story = {versions: ['foo', 'bar']};
    fix.detectChanges();
    expect(el.querySelectorAll('i').length).toEqual(2);
  }));

  it('shows a helpful message if you have no versions', buildComponent((fix, el, upload) => {
    upload.story = {versions: []};
    fix.detectChanges();
    expect(el.querySelector('h1').textContent).toMatch('You have no audio versions for this story');
  }));

});