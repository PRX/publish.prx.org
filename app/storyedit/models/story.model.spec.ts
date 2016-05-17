import {it, describe, beforeEach, expect} from 'angular2/testing';
import {MockCmsService} from '../../shared/cms/cms.mocks';
import {StoryModel} from './story.model';
import {AudioVersionModel} from './audio-version.model';

describe('StoryModel', () => {

  let cms = <any> new MockCmsService();

  let authMock: any, accountMock: any, storyMock: any;
  beforeEach(() => {
    authMock = cms.mock('prx:authorization', {});
    spyOn(AudioVersionModel.prototype, 'init').and.stub();
  });

  const makeStory = (data?: any, versions?: any[]) => {
    accountMock = authMock.mock('prx:default-account', {id: 'account-id'});
    storyMock = data ? authMock.mock('prx:story', data) : null;
    if (storyMock) { storyMock.mockItems('prx:audio-versions', versions || []); }
    return new StoryModel(accountMock, storyMock);
  };

  describe('constructor', () => {

    it('loads data from the haldoc', () => {
      let story = makeStory({title: 'Hello World'});
      expect(story.title).toEqual('Hello World');
      expect(story.isNew).toBeFalsy();
    });

    it('parses dates', () => {
      let story = makeStory({
        publishedAt: '2002-02-02T02:02:02.000Z',
        updatedAt: '2004-04-04T04:04:04'
      });
      expect(story.publishedAt).toBeAnInstanceOf(Date);
      expect(story.updatedAt).toBeAnInstanceOf(Date);
      expect(story.publishedAt.getFullYear()).toEqual(2002);
      expect(story.updatedAt.getMonth()).toEqual(3);
    });

    it('parses tags', () => {
      let story = makeStory({tags: ['Foo', 'Arts', 'Bar', 'Food']});
      expect(story.genre).toEqual('Arts');
      expect(story.subGenre).toEqual('Food');
      expect(story.extraTags).toEqual('Foo, Bar');
    });

    it('allows only a single genre', () => {
      let story = makeStory({tags: ['Business', 'Arts', 'Education']});
      expect(story.genre).toEqual('Business');
      expect(story.subGenre).toEqual('');
      expect(story.extraTags).toEqual('');
    });

    it('allows only subGenres of the parent', () => {
      let story = makeStory({tags: ['Arts', 'Business News']});
      expect(story.subGenre).toEqual('');
      story = makeStory({tags: ['Business News']});
      expect(story.subGenre).toEqual('');
      story = makeStory({tags: ['Business News', 'Business']});
      expect(story.subGenre).toEqual('Business News');
    });

  });

  describe('key', () => {

    it('uses the story id for the key', () => {
      expect(makeStory({id: 'story-id'}).key()).toContain('story-id');
    });

    it('falls back to the account id', () => {
      expect(makeStory(null).key()).toContain('account-id');
    });

    it('will just call it a new story if nothing else', () => {
      let nothin = new StoryModel(null, null);
      expect(nothin.key()).toMatch(/\.new$/);
    });

  });

  describe('related', () => {

    it('loads audio versions', () => {
      let story = makeStory({}, [{label: 'version-one'}, {label: 'version-two'}]);
      expect(story.versions.length).toEqual(2);
    });

    it('sets a default version for new stories', () => {
      let story = makeStory(null);
      expect(story.versions.length).toEqual(1);
    });

  });

  describe('encode', () => {

    it('returns only saveable attributes', () => {
      let story = makeStory({id: 1, title: '2', shortDescription: '3', tags: ['4'],
        publishedAt: '2002-02-02T02:02:02', updatedAt: '2004-04-04T04:04:04'});
      let json = story.encode();
      expect(Object.keys(json).sort()).toEqual(['shortDescription', 'tags', 'title']);
    });

    it('combines tag fields', () => {
      let story = makeStory();
      story.genre = 'Hello';
      story.subGenre = 'World';
      story.extraTags = 'And,Some ,   More tags, Go here';
      let json = <any> story.encode();
      let tags = json.tags.sort();
      expect(tags).toEqual(['And', 'Go here', 'Hello', 'More tags', 'Some', 'World']);
    });

  });

  describe('saveNew', () => {

    it('creates a new story off the account', () => {
      let story = makeStory();
      spyOn(accountMock, 'create').and.callFake((rel: string) => {
        expect(rel).toEqual('prx:stories');
      });
      story.saveNew({hello: 'world'});
      expect(accountMock.create).toHaveBeenCalled();
    });

  });

});
