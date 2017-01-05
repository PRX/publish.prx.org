import { cit, create, provide } from '../../../testing';
import { ImageUploadComponent } from './image-upload.component';
import { UploadService } from '../../core/upload/upload.service';

fdescribe('ImageUploadComponent', () => {

  create(ImageUploadComponent);

  provide(UploadService, {
    add: () => null,
    validFileType: () => true
  });

  let imageDataURI = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

  function dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/gif'});
  }

  let model;
  beforeEach(() => {
    model = {
      images: [],
      isChanged: false,
      changed: () => model.isChanged,
      addImage: upload => {
        model.images.push({});
      }
    };
  });


  cit('shows an indicator for no images', (fix, el, comp) => {
    comp.model = model;
    comp.minWidth = 123;
    comp.minHeight = 456;
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toContainText('123 x 456');
  });

  cit('shows an indicator for a deleted image', (fix, el, comp) => {
    comp.model = model;
    comp.model.images.push({isDestroy: true});
    comp.model.isChanged = true;
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toQuery('.new-image.changed');
  });

  cit('ignores deleted images', (fix, el, comp) => {
    comp.model = model;
    comp.model.images.push({isDestroy: false});
    comp.model.isChanged = true;
    expect(comp.noImages).toEqual(false);
    expect(comp.model.images.length).toEqual(1);
    comp.model.images[0].isDestroy = true;
    expect(comp.noImages).toEqual(true);
    expect(comp.model.images.length).toEqual(1);
  });

  cit('adds an image', (fix, el, comp, done) => {
    comp.model = model;
    comp.model.isChanged = true;
    comp.minWidth = comp.minHeight = 0;
    comp.addUpload(dataURItoBlob(imageDataURI));
    comp.reader.addEventListener('loadend', () => {
      fix.detectChanges();
      expect(el).not.toContainText('Add Image');
      expect(el).toQuery('publish-image-file');
      done();
    });
  });

  cit('won\'t add an image that doesn\'t meet min width and height specifications', (fix, el, comp, done) => {
    comp.model = model;
    comp.model.isChanged = true;
    comp.minWidth = comp.minHeight = 1400;
    comp.addUpload(dataURItoBlob(imageDataURI));
    comp.reader.addEventListener('loadend', () => {
      fix.detectChanges();
      expect(el).toContainText(`should be at least ${comp.minWidth} x ${comp.minHeight} px`);
      expect(comp.model.images.length).toEqual(0);
      done();
    });
  });

  cit('validates file type', (fix, el, comp) => {
    comp.model = model;
    comp.model.isChanged = true;
    let testFile = dataURItoBlob(imageDataURI);
    spyOn(comp.uploadService, 'validFileType').and.returnValue(false);
    comp.addUpload(testFile);
    expect(comp.uploadService.validFileType).toHaveBeenCalledWith(testFile, ['jpeg', 'png']);
    fix.detectChanges();
    expect(el).toContainText('unacceptable format');
    expect (comp.model.images.length).toEqual(0);
  });

});
