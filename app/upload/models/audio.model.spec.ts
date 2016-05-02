import {it, describe, beforeEach, expect} from 'angular2/testing';
import {Observable, Subscriber} from 'rxjs';
import {MockHalDoc} from '../../shared/cms/cms.mocks';
import {AudioModel} from './audio.model';

describe('AudioModel', () => {

  describe('constructor', () => {

    it('copies a whitelist of properties', () => {
      let audio = new AudioModel({foo: 'bar', id: 4, filename: 'hello', progress: 10});
      expect(audio['foo']).toBeUndefined();
      expect(audio.id).toEqual(4);
      expect(audio.filename).toEqual('hello');
      expect(audio.progress).toBeUndefined();
    });

    it('builds from a hal doc', () => {
      let doc = new MockHalDoc({filename: 'hello'});
      let audio = AudioModel.fromDoc(doc);
      expect(audio.filename).toEqual('hello');
      expect(audio.doc).toEqual(doc);
    });

    it('builds from an upload', () => {
      spyOn(AudioModel.prototype, 'startUpload').and.returnValue(null);
      let upload: any = {name: 'the-upload.file', file: {size: 10}};
      let version = new MockHalDoc();
      let audio = AudioModel.fromUpload(upload, version);
      expect(audio.filename).toEqual('the-upload.file');
      expect(audio.size).toEqual(10);
      expect(audio.upload).toEqual(upload);
      expect(audio.version).toEqual(version);
      expect(audio.startUpload).toHaveBeenCalled();
    });

  });

  describe('status', () => {

    const build = (status: string) => {
      return new AudioModel({status: status});
    };

    it('isError', () => {
      expect(build('uploading').isError).toBeFalsy();
      expect(build('upload failed').isError).toBeTruthy();
      expect(build('whatever').isError).toBeFalsy();
    });

    it('isUploading', () => {
      expect(build('upload failed').isUploading).toBeTruthy();
      expect(build('uploaded').isUploading).toBeFalsy();
      expect(build('save failed').isUploading).toBeTruthy();
    });

    it('isProcessing', () => {
      expect(build('saving').isProcessing).toBeFalsy();
      expect(build('uploaded').isProcessing).toBeTruthy();
      expect(build('whatev').isProcessing).toBeFalsy();
    });

    it('isDone', () => {
      expect(build('saving').isDone).toBeFalsy();
      expect(build('done').isDone).toBeTruthy();
      expect(build('whatev').isDone).toBeFalsy();
    });

  });

  describe('startUpload', () => {

    let audio: AudioModel, progress: Subscriber<number>;
    beforeEach(() => {
      audio = new AudioModel();
      audio.upload = <any> {};
      audio.upload.progress = Observable.create((obs: any) => { progress = obs; });
    });

    it('updates progress', () => {
      audio.startUpload();
      expect(audio.progress).toEqual(0);
      expect(audio.status).toEqual('uploading');
      progress.next(0.24);
      expect(audio.progress).toEqual(0.24);
    });

    it('watches for errors', () => {
      audio.startUpload();
      progress.next(0.44);
      spyOn(console, 'error').and.stub();
      progress.error('goodbye');
      expect(audio.progress).toEqual(0.44);
      expect(audio.status).toEqual('upload failed');
    });

    it('starts saving', () => {
      spyOn(window, 'setTimeout').and.callFake((fn: Function) => fn() );
      spyOn(audio, 'startSaving').and.stub();
      audio.startUpload();
      progress.complete();
      expect(audio.progress).toEqual(0);
      expect(audio.status).toEqual('uploading');
      expect(audio.startSaving).toHaveBeenCalled();
    });

  });

  describe('startSaving', () => {

    let audio: AudioModel, version: MockHalDoc, create: Subscriber<any>;
    beforeEach(() => {
      version = new MockHalDoc();
      audio = new AudioModel({filename: 'hello'});
      audio.upload = <any> {url: () => { return 'some-url'; }};
      audio.version = version;
      spyOn(version, 'create').and.returnValue(Observable.create((obs: any) => { create = obs; }));
      spyOn(audio, 'startProcessing').and.stub();
    });

    it('creates a new audio file for this version', () => {
      audio.startSaving();
      expect(audio.status).toEqual('saving');
      expect(audio.startProcessing).not.toHaveBeenCalled();
      expect(version.create).toHaveBeenCalled();
      create.next({title: 'fake doc'});
      expect(audio.startProcessing).toHaveBeenCalled();
    });

    it('monitors for errors', () => {
      audio.startSaving();
      spyOn(console, 'error').and.stub();
      create.error('goodbye');
      expect(audio.status).toEqual('save failed');
    });

  });

  describe('startProcessing', () => {

    it('is all just smoke and mirrors', () => {
      spyOn(window, 'setTimeout').and.callFake((fn: Function) => fn() );
      let audio = new AudioModel();
      audio.startProcessing();
      expect(audio.progress).toEqual(1.0);
      expect(audio.status).toEqual('done');
    });

  });

  describe('changePosition', () => {

    it('updates the doc with the new position', () => {
      let audio = new AudioModel();
      audio.doc = new MockHalDoc({id: 'something'});
      spyOn(audio.doc, 'update').and.returnValue(Observable.empty());
      audio.changePosition(99);
      expect(audio.doc.update).toHaveBeenCalledWith({position: 99});
    });

  });

  describe('destroy', () => {

    it('cancels in-progress uploads', () => {
      let audio = new AudioModel();
      audio.upload = <any> {cancel: () => { return; }};
      spyOn(audio.upload, 'cancel').and.stub();
      audio.destroy();
      expect(audio.upload.cancel).toHaveBeenCalled();
    });

    it('destroys existing documents', () => {
      let audio = new AudioModel();
      audio.doc = new MockHalDoc();
      spyOn(audio.doc, 'destroy').and.returnValue(Observable.empty());
      audio.destroy();
      expect(audio.doc.destroy).toHaveBeenCalled();
    });

  });

  describe('unsubscribe', () => {

    it('stops listening to upload progress', () => {
      let audio = new AudioModel(), progress: Subscriber<number>;
      audio.upload = <any> {};
      audio.upload.progress = Observable.create((obs: any) => { progress = obs; });
      audio.startUpload();
      progress.next(0.24);
      expect(audio.progress).toEqual(0.24);
      audio.unsubscribe();
      progress.next(0.55);
      expect(audio.progress).toEqual(0.24);
    });

  });

});
