import { cit, create, provide } from '../../../testing';
import { of as observableOf } from 'rxjs';
import { ImageUploadComponent } from './image-upload.component';
import { UploadService } from 'ngx-prx-styleguide';

describe('ImageUploadComponent', () => {

  create(ImageUploadComponent);

  provide(UploadService, {
    add: () => observableOf(null),
    validFileType: () => true,
    createWithConfig: () => null
  });

  let imageDataURI = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
  let notSquareImageDataURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJCAYAAAACTR1pAA\
AAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABpJREFUeNpi/P//PwM5gImBTDCqcVBpBAgwAAtnAw/QRSp6AAAAAElFTkSuQmCC';

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
    fix.detectChanges();
    expect(comp.hasImages).toEqual(true);
    expect(comp.hasDestroyed).toEqual(false);
    expect(comp.images.length).toEqual(1);

    comp.model.images[0].isDestroy = true;
    fix.detectChanges();
    expect(comp.hasImages).toEqual(false);
    expect(comp.hasDestroyed).toEqual(true);
    expect(comp.images.length).toEqual(1);

    comp.model.images[0].isNew = true;
    fix.detectChanges();
    expect(comp.hasImages).toEqual(false);
    expect(comp.hasDestroyed).toEqual(false);
    expect(comp.images.length).toEqual(1);
  });

  cit('filters to an image purpose', (fix, el, comp) => {
    comp.model = model;
    comp.model.images = [{purpose: 'what'}, {purpose: 'ev'}, {purpose: 'er'}];
    fix.detectChanges();
    expect(comp.images.length).toEqual(3);

    comp.model.images = [{purpose: 'foo'}, {purpose: 'foo'}, {purpose: 'bar'}];
    comp.purpose = 'foo';
    comp.ngDoCheck();
    expect(comp.images.length).toEqual(2);
  });

  cit('adds an image', (fix, el, comp, done) => {
    comp.model = model;
    comp.model.isChanged = true;
    comp.minWidth = comp.minHeight = 0;
    comp.addUpload(dataURItoBlob(imageDataURI));
    comp.reader.addEventListener('loadend', () => {
      comp.browserImage.addEventListener('load', () => {
        fix.detectChanges();
        expect(el).not.toContainText('Add Image');
        expect(el).toQuery('publish-image-file');
        done();
      });
    });
  });

  cit('won\'t add an image that doesn\'t meet min width and height specifications', (fix, el, comp, done) => {
    comp.model = model;
    comp.model.isChanged = true;
    comp.minWidth = comp.minHeight = 1400;
    comp.addUpload(dataURItoBlob(imageDataURI));
    comp.reader.addEventListener('loadend', () => {
      comp.browserImage.addEventListener('load', () => {
        fix.detectChanges();
        expect(el).toContainText(`should be at least ${comp.minWidth} x ${comp.minHeight} px`);
        expect(comp.model.images.length).toEqual(0);
        done();
      });
    });
  });

  cit('optionally requires image to be square', (fix, el, comp, done) => {
    comp.model = model;
    comp.model.isChanged = true;
    comp.minWidth = comp.minHeight = 1;
    comp.square = true;
    comp.addUpload(dataURItoBlob(notSquareImageDataURI));
    comp.reader.addEventListener('loadend', () => {
      comp.browserImage.addEventListener('load', () => {
        fix.detectChanges();
        expect(el).toContainText('width and height must be the same');
        expect(comp.model.images.length).toEqual(0);
        done();
      });
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
