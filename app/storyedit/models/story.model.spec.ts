import {it, describe, beforeEach, expect} from 'angular2/testing';
import {MockCmsService} from '../../shared/cms/cms.mocks';
import {StoryModel} from './story.model';

describe('StoryModel', () => {

  let cms = <any> new MockCmsService();

  let auth: any;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {}); // clears mocks
  });

  const makeStory = (data = {}) => {
    auth.mock('prx:story', data);
    return new StoryModel(cms, 'any-story-id');
  };

  describe('constructor', () => {

    it('loads existing stories from the CMS', () => {
      let story = makeStory({title: 'Hello World'});
      expect(story.title).toEqual('Hello World');
      expect(story.isLoaded).toBeTruthy();
      expect(story.isNew).toBeFalsy();
    });

    it('looks up the default account for new stories', () => {
      auth.mock('prx:default-account', {});
      let story = new StoryModel(cms);
      expect(story.title).toBeUndefined();
      expect(story.isLoaded).toBeTruthy();
      expect(story.isNew).toBeTruthy();
    });

  });

  describe('setDoc', () => {

    it('sets attributes on the story', () => {
      let story = makeStory();
      story.setDoc(<any> {id: 12, title: 'hello'});
      expect(story.id).toEqual(12);
      expect(story.title).toEqual('hello');
    });

    it('parses dates', () => {
      let story = makeStory();
      story.setDoc(<any> {
        publishedAt: '2002-02-02T02:02:02.000Z',
        updatedAt: '2004-04-04T04:04:04'
      });
      expect(story.publishedAt).toBeAnInstanceOf(Date);
      expect(story.updatedAt).toBeAnInstanceOf(Date);
      expect(story.publishedAt.getFullYear()).toEqual(2002);
      expect(story.updatedAt.getMonth()).toEqual(3);
    });

    it('parses tags', () => {
      let story = makeStory();
      story.setDoc(<any> {tags: ['Foo', 'Arts', 'Bar', 'Food']});
      expect(story.genre).toEqual('Arts');
      expect(story.subGenre).toEqual('Food');
      expect(story.extraTags).toEqual('Foo, Bar');
    });

    it('allows only a single genre', () => {
      let story = makeStory();
      story.setDoc(<any> {tags: ['Business', 'Arts', 'Education']});
      expect(story.genre).toEqual('Business');
      expect(story.subGenre).toBeUndefined();
      expect(story.extraTags).toBeUndefined();
    });

    it('allows only subGenres of the parent', () => {
      let story = makeStory();
      story.setDoc(<any> {tags: ['Arts', 'Business News']});
      expect(story.subGenre).toBeUndefined();
      story.setDoc(<any> {tags: ['Business News']});
      expect(story.subGenre).toBeUndefined();
      story.setDoc(<any> {tags: ['Business News', 'Business']});
      expect(story.subGenre).toEqual('Business News');
    });

  });

  describe('toJSON', () => {

    it('returns only saveable attributes', () => {
      let story = makeStory({id: 1, title: '2', shortDescription: '3', tags: ['4'],
        publishedAt: '2002-02-02T02:02:02', updatedAt: '2004-04-04T04:04:04'});
      let json = story.toJSON();
      expect(Object.keys(json).sort()).toEqual(['shortDescription', 'tags', 'title']);
    });

    it('combines tag fields', () => {
      let story = makeStory();
      story.genre = 'Hello';
      story.subGenre = 'World';
      story.extraTags = 'And,Some ,   More tags, Go here';
      let json = <any> story.toJSON();
      let tags = json.tags.sort();
      expect(tags).toEqual(['And', 'Go here', 'Hello', 'More tags', 'Some', 'World']);
    });

  });

  describe('save', () => {

    it('updates existing docs with json', () => {
      let story = makeStory({title: 'Start title'});
      spyOn(story, 'toJSON').and.returnValue({title: 'Changed it'});
      story.save().subscribe((wasNew) => {
        expect(wasNew).toBeFalsy();
        expect(story.title).toEqual('Changed it');
      });
      expect(story.toJSON).toHaveBeenCalled();
    });

    it('creates new docs on the default account', () => {
      let account = auth.mock('prx:default-account', {});
      let story = new StoryModel(cms);
      spyOn(story, 'toJSON').and.returnValue({title: 'Created it'});
      expect(account.MOCKS['prx:stories']).toBeUndefined();
      story.save().subscribe((wasNew) => {
        expect(wasNew).toBeTruthy();
        expect(story.title).toEqual('Created it');
      });
      expect(story.toJSON).toHaveBeenCalled();
      expect(account.MOCKS['prx:stories']).toBeDefined();
    });

  });

  describe('destroy', () => {

    it('deletes the underlying haldoc', () => {
      let story = makeStory();
      expect(story['_destroyed']).toBeUndefined();
      story.destroy().subscribe((deleted) => {
        expect(deleted).toBeTruthy();
      });
      expect(story.doc['_destroyed']).toEqual(true);
    });

  });

  describe('invalid', () => {

    const invalidate = (field: string, value: any): string => {
      let story = makeStory();
      story[field] = value;
      return story.invalid(field);
    };

    it('validates title', () => {
      expect(invalidate('title', null)).toMatch('is required');
      expect(invalidate('title', '')).toMatch('is required');
      expect(invalidate('title', 'a')).toMatch('is too short');
      expect(invalidate('title', 'hello world')).toBeUndefined();
    });

    it('validates short description', () => {
      expect(invalidate('shortDescription', null)).toMatch('is required');
      expect(invalidate('shortDescription', '')).toMatch('is required');
      expect(invalidate('shortDescription', 'a')).toMatch('is too short');
      expect(invalidate('shortDescription', 'hello world')).toBeUndefined();
    });

    it('validates genre', () => {
      expect(invalidate('genre', null)).toMatch('is required');
      expect(invalidate('genre', '')).toMatch('is required');
      expect(invalidate('genre', 'hello world')).toBeUndefined();
    });

    it('validates sub genre', () => {
      expect(invalidate('subGenre', null)).toMatch('is required');
      expect(invalidate('subGenre', '')).toMatch('is required');
      expect(invalidate('subGenre', 'hello world')).toBeUndefined();
    });

    it('validates extra tags', () => {
      expect(invalidate('extraTags', null)).toBeUndefined();
      expect(invalidate('extraTags', '')).toBeUndefined();
      expect(invalidate('extraTags', 'tag1,  tag2 , andtag4,')).toBeUndefined();
      expect(invalidate('extraTags', 'tag1,  t2')).toMatch('must contain at least 3 char');
    });

    it('validates genre/sub/extra tags', () => {
      let story = makeStory();
      story.genre = 'hello world';
      story.subGenre = '';
      story.extraTags = 'something, e';
      expect(story.invalid('tags')).toMatch('SubGenre is required');
      story.subGenre = 'hello world';
      expect(story.invalid('tags')).toMatch('Tags must contain at least');
      story.extraTags = 'something, else';
      expect(story.invalid('tags')).toBeUndefined();
    });

    it('validates the whole story', () => {
      let story = makeStory({title: 'hello world', shortDescription: 'hello world'});
      expect(story.invalid()).toBeTruthy();
      story.genre = 'foo';
      story.subGenre = 'bar';
      expect(story.invalid()).toBeFalsy();
    });

  });

  describe('changed', () => {

    it('compares fields against their initial values', () => {
      let story = makeStory({title: 'hello world', tags: ['foo']});
      expect(story.changed('title')).toBeFalsy();
      expect(story.changed('genre')).toBeFalsy();
      expect(story.changed('extraTags')).toBeFalsy();
      story.title = 'something else';
      story.genre = 'world';
      story.extraTags = 'foo';
      expect(story.changed('title')).toBeTruthy();
      expect(story.changed('genre')).toBeTruthy();
      expect(story.changed('extraTags')).toBeFalsy();
    });

    it('checks the whole story for changes', () => {
      let story = makeStory({title: 'hello world', tags: ['foo']});
      expect(story.changed()).toBeFalsy();
      story.subGenre = 'a';
      expect(story.changed()).toBeTruthy();
    });

  });

});
