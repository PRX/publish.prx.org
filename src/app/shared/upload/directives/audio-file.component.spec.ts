import { cit, create, provide, stubPipe, By } from '../../../../testing';
import { AudioFileComponent } from './audio-file.component';
import { UploadService } from '../../../core/upload/upload.service';

describe('AudioFileComponent', () => {

  create(AudioFileComponent, false);
  stubPipe('filesize');
  stubPipe('duration');
  provide(UploadService, {find: uuid => uuid === 'testuuid' ? 'foobar' : null});

  const mockFile = (data: any = {}): {} => {
    let file = <any> {};
    file.filename = 'My Filename';
    file.size = 10;
    file.changed = () => data._changed;
    file.invalid = () => data._invalid;
    file.unsubscribe = () => true;
    for (let key of Object.keys(data)) { file[key] = data[key]; }
    return file;
  };

  cit('shows the file', (fix, el, comp) => {
    comp.audio = mockFile();
    fix.detectChanges();
    expect(el).toQueryText('.info span', 'My Filename');
    expect(el).toQueryText('.info .size', '(10)');
  });

  cit('shows audio duration', (fix, el, comp) => {
    comp.audio = mockFile();
    comp.audio.duration = '1:23:45';
    fix.detectChanges();
    expect(el).toQueryText('.info .size', '(1:23:45)');
  });

  cit('shows a status indicator', (fix, el, comp) => {
    comp.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el).toQueryText('.progress p', 'Uploading');
    comp.audio = mockFile({isUploading: true, isUploadError: true});
    fix.detectChanges();
    expect(el).toQueryText('.progress p', 'Upload Error');
    comp.audio = mockFile();
    fix.detectChanges();
    expect(el).not.toQuery('.progress p');
  });

  cit('shows progress while uploading', (fix, el, comp) => {
    comp.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el).toQuery('.meter');
    comp.audio = mockFile();
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
    comp.audio = mockFile({isUploading: true, isUploadError: true});
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
    comp.audio = mockFile({isUploading: true});
    comp.canceled = true;
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
  });

  cit('shows progress while processing', (fix, el, comp) => {
    comp.audio = mockFile({isProcessing: true});
    fix.detectChanges();
    expect(el).toQuery('.meter');
    comp.audio = mockFile({isProcessError: true});
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
    comp.audio = mockFile({isProcessing: true});
    comp.canceled = true;
    fix.detectChanges();
    expect(el).not.toQuery('.meter');
  });

  cit('follows progress', (fix, el, comp) => {
    comp.audio = mockFile({isUploading: true, progress: 0});
    fix.detectChanges();
    let meter = el.query(By.css('.meter span'));
    expect(meter.nativeElement.style.width).toEqual('0%');
    comp.audio.progress = 0.4;
    fix.detectChanges();
    expect(meter.nativeElement.style.width).toEqual('40%');
  });

  cit('hides reordering/cancel for canceled uploads', (fix, el, comp) => {
    comp.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el).toQuery('.reorder i');
    expect(el).toQuery('.cancel i');
    comp.canceled = true;
    fix.detectChanges();
    expect(el).not.toQuery('.reorder i');
    expect(el).not.toQuery('.cancel i');
  });

  cit('shows a canceled indicator', (fix, el, comp) => {
    comp.canceled = true;
    comp.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el).toQueryText('.canceled p', 'Upload Canceled');
    comp.audio.isUploading = false;
    fix.detectChanges();
    expect(el).toQueryText('.canceled p', 'File Deleted');
  });

  cit('retries errored uploads', (fix, el, comp) => {
    comp.audio = mockFile({isUploadError: true, isUploading: true, upload: true, retryUpload: null});
    spyOn(comp.audio, 'retryUpload').and.returnValue(null);
    fix.detectChanges();
    el.query(By.css('.retry a')).nativeElement.click();
    expect(comp.audio.retryUpload).toHaveBeenCalled();
  });

  cit('retries processing', (fix, el, comp) => {
    comp.audio = mockFile({isProcessError: true, retryProcessing: null});
    spyOn(comp.audio, 'retryProcessing').and.returnValue(null);
    fix.detectChanges();
    el.query(By.css('.retry a')).nativeElement.click();
    expect(comp.audio.retryProcessing).toHaveBeenCalled();
  });

  cit('cancels uploads', (fix, el, comp) => {
    spyOn(window, 'setTimeout').and.callFake((fn: Function) => fn() );
    comp.audio = mockFile({isUploading: true, destroy: null});
    spyOn(comp.audio, 'destroy').and.returnValue(null);
    fix.detectChanges();
    el.query(By.css('.cancel i')).nativeElement.click();
    expect(comp.audio.destroy).toHaveBeenCalled();
    expect(comp.canceled).toEqual(false); // resets after timeout
  });

  cit('finds in-progress uploads', (fix, el, comp) => {
    comp.audio = mockFile({uuid: 'testuuid', watchUpload: null});
    spyOn(comp.audio, 'watchUpload').and.stub;
    fix.detectChanges();
    expect(comp.audio.watchUpload).toHaveBeenCalledWith('foobar', false);
  });

});
