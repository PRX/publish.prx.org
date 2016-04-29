import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent, mockDirective} from '../../../util/test-helper';
import {EditComponent} from './edit.component';
import {StoryFieldComponent} from './storyfield.component';
import {UploadComponent} from '../../upload/upload.component';

describe('EditComponent', () => {

  setupComponent(EditComponent);

  mockDirective(StoryFieldComponent, {selector: 'story-field', template: '<i>field</i>'});

  mockDirective(UploadComponent, {selector: 'audio-uploader', template: '<i>upload</i>'});

  it('does not render until the story is loaded', buildComponent((fix, el, edit) => {
    expect(el.textContent.trim()).toEqual('');
    edit.story = {isLoaded: false};
    fix.detectChanges();
    expect(el.querySelector('story-field')).toBeNull();
    edit.story.isLoaded = true;
    fix.detectChanges();
    expect(el.querySelector('story-field')).not.toBeNull();
  }));

});
