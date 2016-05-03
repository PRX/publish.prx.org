import {it, describe, expect} from 'angular2/testing';
import {StoryInvalid} from './story.invalid';

describe('StoryInvalid', () => {

  const invalidate = (field: string, value: any): string => {
    let storyInvalid = new StoryInvalid();
    storyInvalid.set(field, value);
    return storyInvalid[field];
  };

  it('validates on construction', () => {
    let storyInvalid = new StoryInvalid({shortDescription: 'something long-ish'});
    expect(storyInvalid.title).toMatch('is required');
    expect(storyInvalid.shortDescription).toBeNull();
  });

  it('validates title', () => {
    expect(invalidate('title', null)).toMatch('is required');
    expect(invalidate('title', '')).toMatch('is required');
    expect(invalidate('title', 'a')).toMatch('is too short');
    expect(invalidate('title', 'hello world')).toBeNull();
  });

  it('validates short description', () => {
    expect(invalidate('shortDescription', null)).toMatch('is required');
    expect(invalidate('shortDescription', '')).toMatch('is required');
    expect(invalidate('shortDescription', 'a')).toMatch('is too short');
    expect(invalidate('shortDescription', 'hello world')).toBeNull();
  });

  it('validates genre', () => {
    expect(invalidate('genre', null)).toMatch('is required');
    expect(invalidate('genre', '')).toMatch('is required');
    expect(invalidate('genre', 'hello world')).toBeNull();
  });

  it('validates sub genre', () => {
    expect(invalidate('subGenre', null)).toMatch('is required');
    expect(invalidate('subGenre', '')).toMatch('is required');
    expect(invalidate('subGenre', 'hello world')).toBeNull();
  });

  it('validates extra tags', () => {
    expect(invalidate('extraTags', null)).toBeNull();
    expect(invalidate('extraTags', '')).toBeNull();
    expect(invalidate('extraTags', 'tag1,  tag2 , andtag4,')).toBeNull();
    expect(invalidate('extraTags', 'tag1,  t2')).toMatch('must contain at least 3 char');
  });

  it('validates genre/sub/extra tags', () => {
    let storyInvalid = new StoryInvalid();
    storyInvalid.set('genre', 'hello world');
    storyInvalid.set('subGenre', '');
    storyInvalid.set('extraTags', 'something, e');
    expect(storyInvalid.tags).toMatch('SubGenre is required');
    storyInvalid.set('subGenre', 'hello world');
    expect(storyInvalid.tags).toMatch('Tags must contain at least');
    storyInvalid.set('extraTags', 'something, else');
    expect(storyInvalid.tags).toBeNull();
  });

  it('validates the whole story', () => {
    let storyInvalid = new StoryInvalid({title: 'hello world', shortDescription: 'hello world'});
    expect(storyInvalid.any).toBeTruthy();
    storyInvalid.set('genre', 'foo');
    storyInvalid.set('subGenre', 'bar');
    expect(storyInvalid.any).toBeFalsy();
  });

});
