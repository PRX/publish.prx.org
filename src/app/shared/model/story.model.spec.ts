import { Observable } from 'rxjs/Observable';
import { cms } from '../../../testing';
import { StoryModel } from './story.model';
import { AudioVersionModel } from './audio-version.model';

describe('StoryModel', () => {

  let authMock: any, accountMock: any, seriesMock: any, storyMock: any;
  beforeEach(() => {
    authMock = cms.mock('prx:authorization', {});
    accountMock = authMock.mock('prx:default-account', {id: 'account-id'});
    seriesMock = authMock.mock('prx:series', {id: 'series-id'});
    spyOn(AudioVersionModel.prototype, 'init').and.stub();
  });

  const makeStory = (data?: any, extra: any = {}) => {
    let parentMock = extra.parent || seriesMock;
    if (data) {
      storyMock = parentMock.mock('prx:story', data);
      storyMock.mockItems('prx:audio-versions', extra.versions || []);
      storyMock.mockItems('prx:images', extra.images || []);
      return new StoryModel(parentMock, storyMock);
    } else {
      return new StoryModel(parentMock, null);
    }
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
      expect(story.publishedAt instanceof Date).toBeTruthy();
      expect(story.updatedAt instanceof Date).toBeTruthy();
      expect(story.publishedAt.getFullYear()).toEqual(2002);
      expect(story.updatedAt.getMonth()).toEqual(3);
    });

    it('parses tags', () => {
      let story = makeStory({tags: ['Foo', 'Arts', 'Bar', 'Food']});
      expect(story.tags).toEqual('Foo, Arts, Bar, Food');
      expect(story.splitTags()).toEqual(['Foo', 'Arts', 'Bar', 'Food']);
    });

  });

  describe('key', () => {

    it('uses the story id for the key', () => {
      expect(makeStory({id: 'story-id'}).key()).toContain('.story-id');
    });

    it('falls back to the series id', () => {
      expect(makeStory(null).key()).toContain('.series-id');
    });

    it('does not use the parent account id for standalone stories', () => {
      expect(makeStory(null, {parent: accountMock}).key()).toContain('.new');
    });

  });

  describe('related', () => {

    it('loads audio versions', () => {
      let versions = [{label: 'version-one'}, {label: 'version-two'}];
      let story = makeStory({title: 'foo'}, {versions: versions});
      expect(story.versions.length).toEqual(2);
    });

    it('sets a default version for new stories', () => {
      let story = makeStory(null);
      expect(story.versions.length).toEqual(1);
    });

    it('chooses the template with \'default\' label for new story in series', () => {
      let versionsWithDefault = [
        {label: 'Old version', count: () => {}},
        {label: 'Default version', count: () => {}},
        {label: 'New version', count: () => {}}
      ];
      spyOn(StoryModel.prototype, 'getSeriesTemplates').and.callFake(() => {
        return Observable.of(versionsWithDefault);
      });
      let story = makeStory(null);
      expect(story.versions[0].label).toEqual('Default version');
    });

    it('defaults to most recent template in series if no \'default\' label template', () => {
      let versionsWithoutDefault = [
        {label: 'Old version', count: () => {}},
        {label: 'New version', count: () => {}}
      ];
      spyOn(StoryModel.prototype, 'getSeriesTemplates').and.callFake(() => {
        return Observable.of(versionsWithoutDefault);
      });
      let story = makeStory(null);
      expect(story.versions[0].label).toEqual('New version');
    });

    it('loads images', () => {
      let images = [{caption: 'something', status: 'complete'}, {caption: 'here', status: 'complete'}];
      let story = makeStory({title: 'foo'}, {images: images});
      expect(story.images.length).toEqual(2);
    });

    it('creates an episode distribution for podcast series', () => {
      let story = makeStory(null);
      expect(story.distributions.length).toEqual(0);
      seriesMock.mockItems('prx:distributions', [{kind: 'podcast'}]);
      story = makeStory(null);
      expect(story.distributions.length).toEqual(1);
    });

  });

  describe('encode', () => {

    it('returns only saveable attributes', () => {
      let story = makeStory({id: 1, title: '2', shortDescription: '3', tags: ['4'],
        publishedAt: '2002-02-02T02:02:02', updatedAt: '2004-04-04T04:04:04'});
      let json = story.encode();
      let allowed = [ 'cleanTitle', 'descriptionMd', 'episodeIdentifier',
                      'releasedAt', 'seasonIdentifier',
                      'shortDescription', 'tags', 'title' ];
      expect(Object.keys(json).sort()).toEqual(allowed);
    });

    it('combines tag fields', () => {
      let story = makeStory();
      story.tags = 'And,Some ,   More tags, Go here  ,Hello, World ,';
      let json = <any> story.encode();
      let tags = json.tags.sort();
      expect(tags).toEqual(['And', 'Go here', 'Hello', 'More tags', 'Some', 'World']);
    });

  });

  describe('saveNew', () => {

    it('creates a new story off the series', () => {
      let story = makeStory();
      spyOn(seriesMock, 'create').and.callFake((rel: string) => {
        expect(rel).toEqual('prx:stories');
      });
      story.saveNew({hello: 'world'});
      expect(seriesMock.create).toHaveBeenCalled();
    });

    it('creates a new story off the account', () => {
      let story = makeStory(null, {parent: accountMock});
      spyOn(accountMock, 'create').and.callFake((rel: string) => {
        expect(rel).toEqual('prx:stories');
      });
      story.saveNew({hello: 'world'});
      expect(accountMock.create).toHaveBeenCalled();
    });

  });

});
