import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent} from '../../../util/test-helper';
import {AudioFileComponent} from './audio-file.component';

describe('AudioFileComponent', () => {

  setupComponent(AudioFileComponent);

  it('shows the file', buildComponent((fix, el, afile) => {
    afile.audio = {filename: 'My Filename', size: 10};
    fix.detectChanges();
    expect(el.querySelector('.info span')).toHaveText('My Filename');
    expect(el.querySelector('.info .size')).toHaveText('(10 B)');
  }));

  it('shows a status indicator', buildComponent((fix, el, afile) => {
    afile.audio = {};
    fix.detectChanges();
    expect(el.querySelector('.progress p')).toHaveText('Unknown');
    afile.audio.status = 'something here';
    fix.detectChanges();
    expect(el.querySelector('.progress p')).toHaveText('Something Here');
  }));

  it('shows progress for uploading/processing uploads', buildComponent((fix, el, afile) => {
    afile.audio = {isUploading: true};
    fix.detectChanges();
    expect(el.querySelector('.meter')).not.toBeNull();
    afile.audio = {isProcessing: true};
    fix.detectChanges();
    expect(el.querySelector('.meter')).not.toBeNull();
    afile.audio = {isDone: true};
    fix.detectChanges();
    expect(el.querySelector('.meter')).toBeNull();
    afile.audio = {isUploading: true, isError: true};
    fix.detectChanges();
    expect(el.querySelector('.meter')).toBeNull();
    afile.audio = {isUploading: true};
    afile.canceled = true;
    fix.detectChanges();
    expect(el.querySelector('.meter')).toBeNull();
  }));

  it('follows progress', buildComponent((fix, el, afile) => {
    afile.audio = {progress: 0.0};
    fix.detectChanges();
    let meter = el.querySelector('.meter span');
    expect(meter['style']['width']).toEqual('0%');
    afile.audio = {progress: 0.4};
    fix.detectChanges();
    expect(meter['style']['width']).toEqual('40%');
  }));

  it('hides reordering for in-progress uploads', buildComponent((fix, el, afile) => {
    afile.audio = {isUploading: true};
    fix.detectChanges();
    expect(el.querySelector('.reorder i')).toBeNull();
    afile.audio.isUploading = false;
    fix.detectChanges();
    expect(el.querySelector('.reorder i')).not.toBeNull();
    afile.canceled = true;
    fix.detectChanges();
    expect(el.querySelector('.reorder i')).toBeNull();
  }));

  it('hides the canceled button for canceled uploads', buildComponent((fix, el, afile) => {
    afile.audio = {isUploading: true};
    fix.detectChanges();
    expect(el.querySelector('.cancel i')).not.toBeNull();
    afile.audio = {isUploading: false};
    fix.detectChanges();
    expect(el.querySelector('.cancel i')).not.toBeNull();
    afile.canceled = true;
    fix.detectChanges();
    expect(el.querySelector('.cancel i')).toBeNull();
  }));

  it('hides progress for canceled or done uploads', buildComponent((fix, el, afile) => {
    afile.audio = {isUploading: true};
    fix.detectChanges();
    expect(el.querySelector('.cancel i')).not.toBeNull();
  }));

  it('shows a canceled indicator', buildComponent((fix, el, afile) => {
    afile.canceled = true;
    afile.audio = {isUploading: true};
    fix.detectChanges();
    expect(el.querySelector('.canceled p')).toHaveText('Upload Canceled');
    afile.audio.isUploading = false;
    fix.detectChanges();
    expect(el.querySelector('.canceled p')).toHaveText('File Deleted');
  }));

  it('retries errored uploads', buildComponent((fix, el, afile) => {
    afile.audio = {isError: true, isUploading: true, startUpload: null};
    spyOn(afile.audio, 'startUpload').and.returnValue(null);
    fix.detectChanges();
    (<HTMLElement> el.querySelector('.retry a')).click();
    expect(afile.audio.startUpload).toHaveBeenCalled();
  }));

  it('cancels uploads', buildComponent((fix, el, afile) => {
    afile.audio = {destroy: null};
    spyOn(afile.audio, 'destroy').and.returnValue(null);
    fix.detectChanges();
    (<HTMLElement> el.querySelector('.cancel i')).click();
    expect(afile.audio.destroy).toHaveBeenCalled();
    expect(afile.canceled).toBeTruthy();
  }));

  it('waits to emit remove event when canceled', buildComponent((fix, el, afile) => {
    jasmine.clock().uninstall();
    jasmine.clock().install();

    let removed = false;
    afile.remove.subscribe(() => { removed = true; });
    afile.audio = {destroy: () => { return; }};
    fix.detectChanges();
    (<HTMLElement> el.querySelector('.cancel i')).click();
    expect(removed).toBeFalsy();
    jasmine.clock().tick(500);
    expect(removed).toBeFalsy();
    jasmine.clock().tick(600);
    expect(removed).toBeTruthy();

    jasmine.clock().uninstall(); // not really needed - angular will nuke it
  }));

});
