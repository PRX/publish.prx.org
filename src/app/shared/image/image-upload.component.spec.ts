import { cit, create, provide } from '../../../testing';
import { ImageUploadComponent } from './image-upload.component';
import { UploadService } from '../../core/upload/upload.service';

describe('ImageUploadComponent', () => {

  create(ImageUploadComponent);

  provide(UploadService, {add: () => null});

  cit('shows an indicator for no images', (fix, el, comp) => {
    comp.model = {images: [], changed: () => false};
    comp.minWidth = 123;
    comp.minHeight = 456;
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toContainText('123x456');
  });

  cit('shows an indicator for a deleted image', (fix, el, comp) => {
    comp.model = {images: [{isDestroy: true}], changed: () => true};
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toQuery('.new-image.changed');
  });

  cit('ignores deleted images', (fix, el, comp) => {
    comp.model = {images: [{isDestroy: false}]};
    expect(comp.noImages).toEqual(false);
    expect(comp.model.images.length).toEqual(1);
    comp.model = {images: [{isDestroy: true}]};
    expect(comp.noImages).toEqual(true);
    expect(comp.model.images.length).toEqual(1);
  });

  cit('adds an image', (fix, el, comp) => {
    comp.model = {images: []};
    comp.addUpload({});
    fix.detectChanges();
    expect(el).not.toContainText('Add Image');
    expect(el).toQuery('publish-image-file');
  });

});
