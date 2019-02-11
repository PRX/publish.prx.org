import { cit, create, provide, By } from '../../../../testing';
import { ImageFileComponent } from './image-file.component';
import { UploadService } from '../../../core/upload/upload.service';

describe('ImageFileComponent', () => {

  create(ImageFileComponent, false);
  provide(UploadService, {find: uuid => uuid === 'testuuid' ? 'foobar' : null});

  const mockImage = (data: any = {}): {} => {
    let file = <any> {};
    file.filename = 'My Imagename';
    file.changed = () => data._changed;
    file.invalid = () => data._invalid;
    file.unsubscribe = () => true;
    for (let key of Object.keys(data)) { file[key] = data[key]; }
    return file;
  };

  cit('shows the image', (fix, el, comp) => {
    comp.image = mockImage();
    fix.detectChanges();
    expect(el).toQuery('prx-image');
    expect(el).toQuery('.info');
  });

  cit('shows progress while uploading', (fix, el, comp) => {
    comp.image = mockImage({isUploading: true});
    fix.detectChanges();
    expect(el).toQuery('.meter');
    comp.image = mockImage();
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
    comp.image = mockImage({isUploading: true, isUploadError: true});
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
    comp.image = mockImage({isUploading: true});
    comp.canceled = true;
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
  });

  cit('shows progress while processing', (fix, el, comp) => {
    comp.image = mockImage({isProcessing: true});
    fix.detectChanges();
    expect(el).toQuery('.meter');
    comp.image = mockImage({isProcessError: true});
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
    comp.image = mockImage({isProcessing: true});
    comp.canceled = true;
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
  });

  cit('follows progress', (fix, el, comp) => {
    comp.image = mockImage({isUploading: true, progress: 0});
    fix.detectChanges();
    let meter = el.query(By.css('.meter span'));
    expect(meter.nativeElement.style.width).toEqual('0%');
    comp.image.progress = 0.4;
    fix.detectChanges();
    expect(meter.nativeElement.style.width).toEqual('40%');
  });

  cit('shows a canceled indicator', (fix, el, comp) => {
    comp.canceled = true;
    comp.image = mockImage({isUploading: true});
    fix.detectChanges();
    expect(el).toQueryText('.canceled p', 'Upload Canceled');
    comp.image.isUploading = false;
    fix.detectChanges();
    expect(el).toQueryText('.canceled p', 'File Deleted');
  });

  cit('finds in-progress uploads', (fix, el, comp) => {
    comp.image = mockImage({uuid: 'testuuid', watchUpload: null});
    spyOn(comp.image, 'watchUpload').and.stub();
    fix.detectChanges();
    expect(comp.image.watchUpload).toHaveBeenCalledWith('foobar', false);
  });

});
