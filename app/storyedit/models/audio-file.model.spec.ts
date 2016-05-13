import {it, describe, expect} from 'angular2/testing';
import {Observable, ConnectableObservable, Subscriber} from 'rxjs';
import {MockCmsService} from '../../shared/cms/cms.mocks';
import {Upload} from '../../upload/services/upload.service';
import {AudioFileModel} from './audio-file.model';

describe('AudioFileModel', () => {

  let cms = <any> new MockCmsService();

  let versionMock: any, fileMock: any;
  const makeFile = (data?: any) => {
    versionMock = cms.mock('prx:version', {id: 'the-version-id'});
    fileMock = null;
    if (data instanceof Upload || typeof data === 'string') {
      return new AudioFileModel(versionMock, data);
    } else if (data) {
      fileMock = versionMock.mock('prx:audio', data);
      return new AudioFileModel(versionMock, fileMock);
    } else {
      return new AudioFileModel(versionMock, null);
    }
  };

  describe('constructor', () => {

    it('builds from an existing doc', () => {
      let audio = makeFile({
        id: 4,
        filename: 'hello',
        progress: 10,
        _links: { enclosure: {href: '/some/link/here'} }
      });
      expect(audio['foo']).toBeUndefined();
      expect(audio.id).toEqual(4);
      expect(audio.filename).toEqual('hello');
      expect(audio.progress).toBeUndefined();
      expect(audio.enclosureHref).toMatch('/some/link/here');
      expect(audio.isNew).toEqual(false);
    });

    it('starts a new upload', () => {
      spyOn(Upload.prototype, 'upload').and.stub();
      let upload = new Upload(<any> {name: 'name.mp3', size: 99}, null, null);
      upload['progress'] = <ConnectableObservable<number>> Observable.of(0.12);

      let audio = makeFile(upload);
      expect(audio.id).toBeUndefined();
      expect(audio.uuid).toEqual(upload.uuid);
      expect(audio.filename).toEqual('name.mp3');
      expect(audio.size).toEqual(99);
      expect(audio.enclosureHref).toMatch(/name\.mp3$/);
      expect(audio.isNew).toEqual(true);
      expect(audio.progress).toEqual(0.12);
    });

    it('loads existing uploads by uuid', () => {
      spyOn(AudioFileModel.prototype, 'restore').and.stub();
      let audio = makeFile('some-uuid');
      expect(audio.uuid).toEqual('some-uuid');
      expect(audio.isNew).toEqual(true);
      expect(audio.restore).toHaveBeenCalled();
      expect(audio.key()).toMatch('some-uuid');
    });

  });

  describe('key', () => {

    it('uses the id for the key', () => {
      expect(makeFile({id: 'audio-file-id'}).key()).toContain('audio-file-id');
    });

    it('falls back to the upload uuid', () => {
      expect(makeFile('some-uuid').key()).toContain('some-uuid');
    });

    it('will just call it a new file if nothing else', () => {
      let nothin = new AudioFileModel(null, null);
      expect(nothin.key()).toMatch(/\.new$/);
    });

  });

  describe('encode', () => {

    it('returns only saveable attributes', () => {
      let audio = makeFile({filename: 'foo', size: 99});
      let keys = Object.keys(audio.encode());
      expect(keys).toContain('filename');
      expect(keys).toContain('size');
      expect(keys).toContain('position');
      expect(keys).not.toContain('status');
      expect(keys).not.toContain('progress');
    });

    it('only returns the upload file for new audio', () => {
      let audio = makeFile({_links: { enclosure: {href: '/something'} }});
      expect(audio.isNew).toEqual(false);
      expect(audio.encode()['upload']).toBeUndefined();
      audio.isNew = true;
      expect(audio.encode()['upload']).toMatch('/something');
    });

  });

  describe('saveNew', () => {

    it('creates a new file off the version', () => {
      let audio = makeFile();
      spyOn(versionMock, 'create').and.callFake((rel: string) => {
        expect(rel).toEqual('prx:audio');
      });
      audio.saveNew({hello: 'world'});
      expect(versionMock.create).toHaveBeenCalled();
    });

  });

  describe('watchUpload', () => {

    it('starts an upload from the beginning', () => {
      let audio = makeFile();
      audio.watchUpload(<any> {progress: Observable.empty()});
      expect(audio.progress).toEqual(0);
      expect(audio.isUploading).toEqual(true);
      expect(audio.isError).toBeNull();
    });

    it('watches for progress', () => {
      let audio = makeFile();
      let progress: Subscriber<number>;
      audio.watchUpload(<any> {progress: Observable.create((obs: any) => { progress = obs; })});
      expect(audio.progress).toEqual(0);
      progress.next(0.41);
      expect(audio.progress).toEqual(0.41);
    });

    it('catches upload errors', () => {
      let audio = makeFile();
      spyOn(console, 'error').and.stub();
      audio.watchUpload(<any> {progress: Observable.throw('woh now')});
      expect(audio.progress).toEqual(0);
      expect(audio.isUploading).toEqual(true);
      expect(audio.isError).toEqual('woh now');
      expect(console.error).toHaveBeenCalled();
    });

  });

  describe('destroy', () => {

    it('unsubscribes uploads', () => {
      let audio = makeFile();
      spyOn(audio, 'unsubscribe').and.stub();
      audio.destroy();
      expect(audio.isDestroy).toEqual(true);
      expect(audio.unsubscribe).toHaveBeenCalled();
    });

    it('cancels uploads', () => {
      spyOn(Upload.prototype, 'upload').and.stub();
      let upload = new Upload(<any> {name: 'name.mp3', size: 99}, null, null);
      upload['progress'] = <ConnectableObservable<number>> Observable.of(0.12);
      spyOn(upload, 'cancel').and.stub();

      let audio = makeFile(upload);
      audio.destroy();
      expect(audio.isDestroy).toEqual(true);
      expect(upload.cancel).toHaveBeenCalled();
    });

    it('deletes new files from local storage', () => {
      let audio = makeFile({id: 1234});
      spyOn(audio, 'unstore').and.stub();
      audio.destroy();
      expect(audio.unstore).not.toHaveBeenCalled();
      audio.isNew = true;
      audio.destroy();
      expect(audio.unstore).toHaveBeenCalled();
    });

  });

});
