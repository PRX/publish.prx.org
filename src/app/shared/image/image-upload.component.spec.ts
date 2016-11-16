import { cit, create, provide } from '../../../testing';
import { ImageUploadComponent } from './image-upload.component';
import { UploadService } from '../../core/upload/upload.service';

describe('ImageUploadComponent', () => {

  create(ImageUploadComponent);

  provide(UploadService, {add: () => null});

  cit('shows an indicator for no images', (fix, el, comp) => {
    comp.model = {images: []};
    comp.minWidth = 123;
    comp.minHeight = 456;
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toContainText('123x456');
  });

  cit('ignores deleted images', (fix, el, comp) => {
    comp.model = {images: [{isDestroy: false}]};
    expect(comp.noImages).toEqual(false);
    expect(comp.model.images.length).toEqual(1);
    comp.model = {images: [{isDestroy: true}]};
    expect(comp.noImages).toEqual(true);
    expect(comp.model.images.length).toEqual(1);
  });

  cit('savagely removes new destroyed images', (fix, el, comp) => {
    comp.model = {images: [{isDestroy: true, isNew: true}]};
    expect(comp.noImages).toEqual(true);
    expect(comp.model.images.length).toEqual(0);
  });

  cit('adds an image', (fix, el, comp) => {
    comp.model = {images: []};
    comp.addUpload({});
    fix.detectChanges();
    expect(el).not.toContainText('Add Image');
    expect(el).toQuery('publish-image-file');
  });

});
