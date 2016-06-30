import {provide} from '@angular/core';
import {it, describe, expect, beforeEachProviders, inject} from '@angular/core/testing';
import {UploadService} from './upload.service';
import {MimeTypeService, MimeDefinition} from '../../../util/mime-type.service';

class MockMimeService {
  lookupFileMimetype(file: File, overrideDefault?: string) {
    return new MimeDefinition('audio/mpeg');
  }
}
interface InjectCallback {
  (mimeTypeService: MimeTypeService, uploadService: UploadService): any;
}
const injectServices = (work: InjectCallback) => {
  return inject([MimeTypeService, UploadService], work);
};

describe('UploadService', () => {

  beforeEachProviders(() => [
    UploadService,
    provide(MimeTypeService, {useClass: MockMimeService})
  ]);

  it('should have an empty list of uploads', injectServices((mimetype, upload) => {
    expect(upload.uploads).toBeAnInstanceOf(Array);
    expect(upload.uploads.length).toEqual(0);
  }));

});
