import { setupComponent, buildComponent, mockDirective } from '../../../test-support';
import { EditComponent } from './edit.component';
import { FancyFieldComponent } from '../../shared/form/fancy-field.component';
import { AudioUploadComponent } from '../../upload/audio-upload.component';

xdescribe('EditComponent', () => {

  setupComponent(EditComponent);

  mockDirective(FancyFieldComponent, {selector: 'story-field', template: '<i>field</i>'});

  mockDirective(AudioUploadComponent, {selector: 'audio-uploader', template: '<i>upload</i>'});

  it('does not render until the story is loaded', buildComponent((fix, el, edit) => {
    edit.story = null;
    fix.detectChanges();
    expect(el.textContent.trim()).toEqual('');
    edit.story = {};
    fix.detectChanges();
    expect(el.querySelector('story-field')).not.toBeNull();
  }));

});
