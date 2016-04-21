import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent, mockDirective} from '../../../util/test-helper';
import {EditComponent} from './edit.component';
import {StoryFieldComponent} from './storyfield.component';

import {Component} from 'angular2/core';
@Component({selector: 'story-field', template: '<i>nothing</i>'})
class EmptyComponent {}

describe('EditComponent', () => {

  setupComponent(EditComponent);
  mockDirective(StoryFieldComponent, EmptyComponent);

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
