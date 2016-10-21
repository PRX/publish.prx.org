import { cms } from '../../../testing';
import { Observable } from 'rxjs';
import { AudioFileModel } from './audio-file.model';

describe('AudioFileModel', () => {

  let versionMock: any, fileMock: any;
  const makeFile = (data?: any) => {
    versionMock = cms.mock('prx:version', {id: 'the-version-id'});
    fileMock = null;
    if (typeof data === 'string') {
      return new AudioFileModel(versionMock, data);
    } else if (data) {
      data.status = 'complete';
      fileMock = versionMock.mock('prx:audio', data);
      return new AudioFileModel(versionMock, fileMock);
    } else {
      return new AudioFileModel(versionMock, null);
    }
  };

  describe('setTemplate', () => {

    it('grabs the label from the template', () => {
      let file = makeFile(null);
      file.setTemplate(<any> {label: 'hello world'});
      expect(file.label).toEqual('hello world');
    });

    it('resets the validators', () => {
      let file = makeFile(null);
      file.VALIDATORS['self'] = null;
      file.setTemplate(<any> {});
      expect(file.VALIDATORS['self'].length).toEqual(1);
    });

    it('has a default label per position', () => {
      let file = makeFile({position: 8});
      file.setTemplate(null);
      expect(file.label).toEqual('Segment H');
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

  describe('saveNew', () => {

    it('creates a new file off the version', () => {
      let audio = makeFile();
      spyOn(versionMock, 'create').and.callFake((rel: string) => {
        expect(rel).toEqual('prx:audio');
        return Observable.empty();
      });
      audio.saveNew({hello: 'world'});
      expect(versionMock.create).toHaveBeenCalled();
    });

  });

  describe('destroy', () => {

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
