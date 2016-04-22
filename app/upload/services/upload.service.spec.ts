import {provide} from 'angular2/core';
import {it, describe, expect, beforeEach, beforeEachProviders, inject, injectAsync} from 'angular2/testing';
import {UploadService} from './upload.service';
import {MimeTypeService, MimeDefinition} from '../../util/mime-type.service';

class MockMimeService {
  lookupFileMimetype(file:File, overrideDefault?:string) {
    return new MimeDefinition('audio/mpeg');
  }
}

describe('UploadService', () => {

  beforeEachProviders(() => [
    UploadService,
    provide(MimeTypeService, {useClass: MockMimeService})
  ]);

  it('should have an empty list of uploads', inject([MimeTypeService, UploadService], (mimeTypeService: MimeTypeService, uploadService: UploadService) => {
    expect(uploadService.uploads).toBeAnInstanceOf(Array);
    expect(uploadService.uploads.length).toEqual(0);
  }));

});
