import { Observable, ConnectableObservable, Subscriber } from 'rxjs';
import { cms } from '../../../test-support';
import { Upload } from '../../core/upload/upload.service';
import { UploadableModel } from './uploadable.model';

class TestUploadableModel extends UploadableModel {
  SETABLE = ['foobar'];
  VALIDATORS = {foobar: <any[]> []};
  key() { return 'foo'; }
  related() { return {}; }
  saveNew() { return Observable.of(null); }
}

describe('UploadableModel', () => {

  let model: TestUploadableModel;
  let upload: Upload;
  beforeEach(() => {
    window.localStorage.clear();
    model = new TestUploadableModel();
    spyOn(Upload.prototype, 'upload').and.stub();
    upload = new Upload(<any> {name: 'name.mp3', size: 99}, null, null);
    upload['progress'] = <ConnectableObservable<number>> Observable.of(0.12);
  });

  describe('initUpload', () => {
    it('enhances the setable fields', () => {
      model.initUpload();
      expect(model.SETABLE).toContain('foobar');
      expect(model.SETABLE).toContain('filename');
      expect(model.SETABLE).toContain('uuid');
    });

    it('enhances the field validations', () => {
      model.initUpload();
      expect(Object.keys(model.VALIDATORS)).toContain('foobar');
      expect(Object.keys(model.VALIDATORS)).toContain('isUploading');
    });

    it('sets the uuid for uploads', () => {
      model.initUpload(null, <any> {});
      expect(model.uuid).toBeNull();
      model.initUpload(null, '9876');
      expect(model.uuid).toEqual('9876');
      upload.uuid = '1234';
      model.initUpload(null, upload);
      expect(model.uuid).toEqual('1234');
    });

    it('initializes with existing haldocs', () => {
      spyOn(model, 'init').and.stub();
      model.initUpload(<any> 'anything', '1234');
      expect(model.init).toHaveBeenCalledWith('anything', null);
      model.initUpload(<any> 'anything', upload);
      expect(model.init).toHaveBeenCalledWith('anything', null);
      let doc = cms.mock('prx:anything', {id: 1234});
      model.initUpload(<any> 'anything', doc);
      expect(model.init).toHaveBeenCalledWith('anything', doc);
    });

    it('sets the upload', () => {
      spyOn(model, 'setUpload').and.stub();
      model.initUpload(null, '1234');
      expect(model.setUpload).not.toHaveBeenCalled();
      model.initUpload(null, upload);
      expect(model.setUpload).toHaveBeenCalledWith(upload);
    });
  });

  describe('setUpload', () => {
    it('sets properties and watches upload', () => {
      spyOn(model, 'watchUpload').and.stub();
      model.setUpload(upload);
      expect(model.filename).toEqual('name.mp3');
      expect(model.size).toEqual(99);
      expect(model.watchUpload).toHaveBeenCalled();
    });

    it('does not watch completed uploads', () => {
      spyOn(model, 'watchUpload').and.stub();
      upload.complete = true;
      model.setUpload(upload);
      expect(model.watchUpload).not.toHaveBeenCalled();
    });
  });

  describe('watchUpload', () => {
    it('starts an upload from the beginning', () => {
      model.watchUpload(<any> {progress: Observable.empty()});
      expect(model.progress).toEqual(0);
      expect(model.isUploading).toEqual(true);
      expect(model.isError).toBeNull();
    });

    it('watches for progress', () => {
      let progress: Subscriber<number>;
      model.watchUpload(<any> {progress: Observable.create((obs: any) => { progress = obs; })});
      expect(model.progress).toEqual(0);
      progress.next(0.41);
      expect(model.progress).toEqual(0.41);
    });

    it('catches upload errors', () => {
      spyOn(console, 'error').and.stub();
      model.watchUpload(<any> {progress: Observable.throw('woh now')});
      expect(model.progress).toEqual(0);
      expect(model.isUploading).toEqual(true);
      expect(model.isError).toEqual('woh now');
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('retries uploads', () => {
    model.initUpload(null, upload);
    model.isUploading = false;
    model.isError = 'yep';
    model.progress = 0.5;
    model.retryUpload();
    expect(model.progress).toEqual(0.12);
    expect(model.isUploading).toEqual(true);
    expect(model.isError).toBeNull();
  });

  it('decodes remote attributes', () => {
    model.doc = cms.mock('anything', {
      filename: 'hello',
      size: 999,
      _links: { enclosure: {href: '/some/link/here'} }
    });
    model.decode();
    expect(model.filename).toEqual('hello');
    expect(model.size).toEqual(999);
    expect(model.enclosureHref).toMatch('/some/link/here');
  });

  describe('encode', () => {
    it('returns only saveable attributes', () => {
      model.isNew = true;
      let keys = Object.keys(model.encode());
      expect(keys).toContain('upload');
      expect(keys).not.toContain('status');
      expect(keys).not.toContain('progress');
    });

    it('only returns the upload file for new audio', () => {
      model.isNew = false;
      let keys = Object.keys(model.encode());
      expect(keys).not.toContain('filename');
      expect(keys).not.toContain('size');
      expect(keys).not.toContain('upload');
    });
  });

  it('cancels uploads when destroyed', () => {
    spyOn(model, 'unsubscribe').and.stub();
    spyOn(upload, 'cancel').and.stub();
    model.initUpload(null, upload);
    model.destroy();
    expect(model.unsubscribe).toHaveBeenCalled();
    expect(upload.cancel).toHaveBeenCalled();
  });

});
