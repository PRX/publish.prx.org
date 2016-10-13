import { cms } from '../../../testing';
import { AudioVersionModel } from './audio-version.model';
import { AudioFileModel } from './audio-file.model';

describe('AudioVersionModel', () => {

  let seriesMock: any, storyMock: any, versionMock: any;
  beforeEach(() => {
    window.localStorage.clear();
    seriesMock = cms.mock('prx:series', {id: 'the-series-id'});
    storyMock = cms.mock('prx:story', {id: 'the-story-id'});
    spyOn(AudioFileModel.prototype, 'init').and.callFake(function() {
      this.filename = 'foobar';
      this.uuid = 'fake-uuid';
      this.status = 'complete';
    });
  });

  const makeVersion = (data?: any, files?: any[]) => {
    versionMock = data ? storyMock.mock('prx:audio-version', data) : null;
    if (versionMock) { versionMock.mockList('prx:audio', files || []); }
    return new AudioVersionModel(seriesMock, storyMock, versionMock);
  };

  describe('constructor', () => {

    it('copies properties from the version doc', () => {
      let version = makeVersion({label: 'foobar'});
      expect(version.label).toEqual('foobar');
    });

    it('sets a default title', () => {
      let version = makeVersion(null);
      expect(version.label).toEqual('Main Audio');
    });

  });

  describe('key', () => {

    it('uses the audio version id', () => {
      expect(makeVersion({id: 'version-id'}).key()).toContain('.version-id');
    });

    it('falls back to the story id', () => {
      expect(makeVersion(null).key()).toContain('new.the-story-id');
    });

    it('falls way back to the series id', () => {
      let seriesOnly = new AudioVersionModel(seriesMock, null, null);
      expect(seriesOnly.key()).toContain('new.series.the-series-id');
    });

    it('also has a key for new stories', () => {
      let nothin = new AudioVersionModel(null, null);
      expect(nothin.key()).toMatch(/\.new$/);
    });

  });

  describe('related', () => {

    it('loads existing audio files', () => {
      let version = makeVersion({}, [{thing: 'one', status: 'complete'}, {thing: 'two', status: 'complete'}]);
      expect(version.files.length).toEqual(2);
    });

    it('loads newly uploaded files', () => {
      let version = makeVersion({}, [{thing: 'one', status: 'complete'}]);
      expect(version.files.length).toEqual(1);
      version.uploadUuids = ['1234'];
      version.related().files.subscribe((files: any[]) => {
        expect(files.length).toEqual(2);
      });
    });

  });

  describe('encode', () => {

    it('really only cares about the label', () => {
      let version = makeVersion({label: 'foobar'});
      expect(version.encode()).toEqual({label: 'foobar'});
    });

  });

  describe('saveNew', () => {

    it('creates a new version off the story', () => {
      let version = makeVersion();
      spyOn(storyMock, 'create').and.callFake((rel: string) => {
        expect(rel).toEqual('prx:audio-versions');
      });
      version.saveNew({label: 'world'});
      expect(storyMock.create).toHaveBeenCalled();
    });

  });

  describe('invalid', () => {

    it('requires at least one audio file', () => {
      let version = makeVersion({label: 'hello'}, []);
      expect(version.invalid()).toMatch(/must upload at least 1/);
    });

  });

  describe('addUpload', () => {

    it('adds and saves the new upload uuid', () => {
      let version = makeVersion({label: 'hello'}, []);
      spyOn(version, 'store').and.stub();
      version.addUpload(<any> {uuid: '1234'});
      expect(version.files.length).toEqual(1);
      expect(version.uploadUuids).toEqual(['1234']);
      expect(version.store).toHaveBeenCalled();
    });

  });

  describe('watchUpload', () => {

    it('lets the file with the matching uuid see the upload', () => {
      let version = makeVersion({label: 'hello'}, [{uuid: 'fake-uuid', status: 'uploading'}]);
      expect(version.files.length).toEqual(1);
      spyOn(version.files[0], 'watchUpload').and.stub();
      version.watchUpload(<any> {uuid: '1234'});
      expect(version.files[0].watchUpload).not.toHaveBeenCalled();
      version.watchUpload(<any> {uuid: 'fake-uuid'});
      expect(version.files[0].watchUpload).toHaveBeenCalled();
    });

  });

});
