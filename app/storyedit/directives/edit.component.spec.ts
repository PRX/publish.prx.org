import {it, describe, expect, beforeEachProviders} from 'angular2/testing';
import {setupComponent, buildComponent, mockDirective} from '../../../util/test-helper';
import {EditComponent} from './edit.component';
import {StoryFieldComponent} from './storyfield.component';
import {StoryTabService} from '../services/storytab.service';
import {UploadComponent} from '../../upload/upload.component';

describe('EditComponent', () => {

  setupComponent(EditComponent);

  beforeEachProviders(() => [StoryTabService]);

  mockDirective(StoryFieldComponent, {selector: 'story-field', template: '<i>field</i>'});

  mockDirective(UploadComponent, {selector: 'audio-uploader', template: '<i>upload</i>'});

  it('does not render until the story is loaded', buildComponent((fix, el, edit) => {
    edit.story = null;
    fix.detectChanges();
    expect(el.textContent.trim()).toEqual('');
    edit.story = {};
    fix.detectChanges();
    expect(el.querySelector('story-field')).not.toBeNull();
  }));

});
