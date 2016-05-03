import {it, describe, expect} from 'angular2/testing';
import {StoryChanged} from './story.changed';

describe('StoryChanged', () => {

  it('compares fields against their initial values', () => {
    let changed = new StoryChanged({title: 'hello world', extraTags: 'foo'});
    expect(changed.title).toBeFalsy();
    expect(changed.genre).toBeFalsy();
    expect(changed.extraTags).toBeFalsy();
    changed.set('title', 'something else');
    changed.set('genre', 'world');
    changed.set('extraTags', 'foo');
    expect(changed.title).toBeTruthy();
    expect(changed.genre).toBeTruthy();
    expect(changed.extraTags).toBeFalsy();
  });

  it('checks the whole story for changes', () => {
    let changed = new StoryChanged({title: 'hello world', tags: ['foo']});
    expect(changed.any).toBeFalsy();
    changed.set('subGenre', 'a');
    expect(changed.any).toBeTruthy();
  });

});
