import {it, describe, expect} from '@angular/core/testing';
import {setupComponent, buildComponent} from '../../../util/test-helper';
import {AudioFileComponent} from './audio-file.component';

describe('AudioFileComponent', () => {

  setupComponent(AudioFileComponent);

  const mockFile = (data: any = {}): {} => {
    let file = <any> {};
    file.filename = 'My Filename';
    file.size = 10;
    file.changed = () => { return data._changed; };
    file.invalid = () => { return data._invalid; };
    for (let key of Object.keys(data)) { file[key] = data[key]; }
    return file;
  };

  it('shows the file', buildComponent((fix, el, afile) => {
    afile.audio = mockFile();
    fix.detectChanges();
    expect(el.querySelector('.info span')).toHaveText('My Filename');
    expect(el.querySelector('.info .size')).toHaveText('(10 B)');
  }));

  it('shows a status indicator', buildComponent((fix, el, afile) => {
    afile.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el.querySelector('.progress p')).toHaveText('Uploading');
    afile.audio = mockFile({isUploading: true, isError: true});
    fix.detectChanges();
    expect(el.querySelector('.progress p')).toHaveText('Upload Error');
    afile.audio = mockFile();
    fix.detectChanges();
    expect(el.querySelector('.progress p')).toBeNull();
  }));

  it('shows progress for uploading/processing uploads', buildComponent((fix, el, afile) => {
    afile.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el.querySelector('.meter')).not.toBeNull();
    afile.audio = mockFile();
    fix.detectChanges();
    expect(el.querySelector('.meter')).toBeNull();
    afile.audio = mockFile({isUploading: true, isError: true});
    fix.detectChanges();
    expect(el.querySelector('.meter')).toBeNull();
    afile.audio = mockFile({isUploading: true});
    afile.canceled = true;
    fix.detectChanges();
    expect(el.querySelector('.meter')).toBeNull();
  }));

  it('follows progress', buildComponent((fix, el, afile) => {
    afile.audio = mockFile({isUploading: true, progress: 0});
    fix.detectChanges();
    let meter = el.querySelector('.meter span');
    expect(meter['style']['width']).toEqual('0%');
    afile.audio.progress = 0.4;
    fix.detectChanges();
    expect(meter['style']['width']).toEqual('40%');
  }));

  it('hides reordering/cancel for canceled uploads', buildComponent((fix, el, afile) => {
    afile.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el.querySelector('.reorder i')).not.toBeNull();
    expect(el.querySelector('.cancel i')).not.toBeNull();
    afile.canceled = true;
    fix.detectChanges();
    expect(el.querySelector('.reorder i')).toBeNull();
    expect(el.querySelector('.cancel i')).toBeNull();
  }));

  it('shows a canceled indicator', buildComponent((fix, el, afile) => {
    afile.canceled = true;
    afile.audio = mockFile({isUploading: true});
    fix.detectChanges();
    expect(el.querySelector('.canceled p')).toHaveText('Upload Canceled');
    afile.audio.isUploading = false;
    fix.detectChanges();
    expect(el.querySelector('.canceled p')).toHaveText('File Deleted');
  }));

  it('retries errored uploads', buildComponent((fix, el, afile) => {
    afile.audio = mockFile({isError: true, isUploading: true, upload: true, retryUpload: null});
    spyOn(afile.audio, 'retryUpload').and.returnValue(null);
    fix.detectChanges();
    (<HTMLElement> el.querySelector('.retry a')).click();
    expect(afile.audio.retryUpload).toHaveBeenCalled();
  }));

  it('cancels uploads', buildComponent((fix, el, afile) => {
    spyOn(window, 'setTimeout').and.callFake((fn: Function) => fn() );
    afile.audio = mockFile({isUploading: true, destroy: null});
    spyOn(afile.audio, 'destroy').and.returnValue(null);
    fix.detectChanges();
    (<HTMLElement> el.querySelector('.cancel i')).click();
    expect(afile.audio.destroy).toHaveBeenCalled();
    expect(afile.canceled).toBeTruthy();
  }));

});
