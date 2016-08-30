import { UploadService } from './upload.service';
import { MimeDefinition } from './mime-type.service';

class MockMimeService {
  lookupFileMimetype(file: File, overrideDefault?: string) {
    return new MimeDefinition('audio/mpeg');
  }
}

describe('UploadService', () => {

  xit('should have an empty list of uploads', () => {
    let mime = new MockMimeService();
    let upload = new UploadService(<any> mime);
    expect(upload.uploads instanceof Array).toBeTruthy();
    expect(upload.uploads.length).toEqual(0);
  });

});
