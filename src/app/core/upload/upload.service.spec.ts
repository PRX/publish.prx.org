import { UploadService, Upload } from './upload.service';
import { MimeDefinition } from './mime-type.service';

describe('UploadService', () => {

  describe('Service', () => {

    const mockMime: any = {
      lookupFileMimetype: (file: File, overrideDefault?: string) => {
        return new MimeDefinition('audio/mpeg');
      }
    };

    let uploader: UploadService;
    beforeEach(() => {
      spyOn(UploadService.prototype, 'init').and.stub();
      spyOn(Upload.prototype, 'upload').and.stub();
      uploader = new UploadService(mockMime);
    });

    it('should have an empty list of uploads', () => {
      expect(uploader.uploads instanceof Array).toBeTruthy();
      expect(uploader.uploads.length).toEqual(0);
    });

    it('adds uploads', () => {
      let upload = uploader.add(<any> {name: 'foo.bar', size: 99}, 'foo/bar');
      expect(upload.uuid.length).toEqual(36);
      expect(upload.name).toEqual('foo.bar');
      expect(upload.size).toEqual(99);
      expect(upload.path).toEqual(`dev/${upload.uuid}/foo.bar`);
      expect(upload.url).toMatch(/^\/\/s3\.amazonaws\.com/);
      expect(upload.s3url).toMatch(/^s3:\/\//);
      expect(upload.contentType).toEqual('foo/bar');
      expect(uploader.uploads.length).toEqual(1);
    });

    it('looks up content-types for added uploads', () => {
      let upload = uploader.add(<any> {name: 'foo.bar'});
      expect(upload.contentType).toEqual('audio/mpeg');
    });

    it('validates file types for added uploads', () => {
      expect(uploader.validFileType(<any> {name: 'foo.bar'}, ['mpeg'])).toEqual(true);
      expect(uploader.validFileType(<any> {name: 'bar.foo'}, ['jpeg'])).toEqual(false);
    });

    it('finds uploads by uuid', () => {
      let upload = uploader.add(<any> {name: 'foo.bar'});
      expect(uploader.find('foobar')).toBeNull();
      expect(uploader.find(upload.uuid)).toEqual(upload);
    });

  });

  describe('Upload', () => {

    let upload: Upload, cancelId: string, addOptions: any;
    beforeEach(() => {
      cancelId = null;
      addOptions = null;
      upload = new Upload(<any> {name: 'foo.bar'}, 'foo/bar', <any> {
        cancel: (id: string) => cancelId = id,
        add: (options: any) => {
          addOptions = options;
          return 'my-upload-id';
        }
      });
    });

    it('cancels in-progress uploads', () => {
      expect(cancelId).toBeUndefined();
      upload.cancel();
      expect(cancelId).toEqual('my-upload-id');
      expect(upload.uploadId).toBeNull();
    });

    it('does not cancel complete uploads', () => {
      expect(cancelId).toBeUndefined();
      upload.complete = true;
      upload.cancel();
      expect(cancelId).toBeUndefined();
    });

    it('passes aws upload options to evaporate', () => {
      expect(addOptions).not.toBeNull();
      expect(Object.keys(addOptions)).toContain('file');
      expect(Object.keys(addOptions)).toContain('name');
      expect(Object.keys(addOptions)).toContain('contentType');
    });

    it('watches upload progress', () => {
      let percent;
      upload.progress.subscribe(p => percent = p);

      expect(percent).toBeUndefined();
      addOptions.progress(.44);
      expect(percent).toEqual(.44);
      addOptions.complete();
      expect(percent).toEqual(1.0);
      expect(upload.complete).toEqual(true);
    });

    it('passes on upload errors', () => {
      let percent, err;
      upload.progress.subscribe(p => percent = p, e => err = e);

      expect(err).toBeUndefined();
      addOptions.error('something went wrong');
      expect(err).toEqual('something went wrong');
    });

  });

});
