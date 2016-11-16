import { cit, create, stubPipe } from '../../../testing';
import { AudioStateComponent } from './audio-state.component';

describe('AudioStateComponent', () => {

  create(AudioStateComponent);

  stubPipe('capitalize');

  cit('states default', (fix, el, comp) => {
    expect(comp.fileState).toEqual('');
    expect(el).toQuery('.state');
  });

  cit('states canceled', (fix, el, comp) => {
    comp.file = {canceled: true};
    fix.detectChanges();
    expect(comp.fileState).toEqual('canceled');
    expect(el).toContainText('File Deleted');
    comp.file.isUploading = true;
    fix.detectChanges();
    expect(el).toContainText('Upload Canceled');
  });

  cit('states upload errors', (fix, el, comp) => {
    comp.file = {isUploadError: 'My error message'};
    fix.detectChanges();
    expect(comp.fileState).toEqual('upload-errored');
    expect(el).toContainText('My error message');
  });

  cit('states uploading', (fix, el, comp) => {
    comp.file = {isUploading: true};
    fix.detectChanges();
    expect(comp.fileState).toEqual('uploading');
    expect(el).toContainText('Uploading');
    expect(el).toQuery('.meter');
  });

  cit('states process errors', (fix, el, comp) => {
    comp.file = {isProcessError: 'My error message'};
    fix.detectChanges();
    expect(comp.fileState).toEqual('process-errored');
    expect(el).toContainText('My error message');
  });

  cit('states processing', (fix, el, comp) => {
    comp.file = {isProcessing: true};
    fix.detectChanges();
    expect(comp.fileState).toEqual('processing');
    expect(el).toContainText('Processing');
    expect(el).toQuery('.meter');
  });

  cit('states invalid', (fix, el, comp) => {
    comp.file = {invalid: () => 'something is bad'};
    fix.detectChanges();
    expect(comp.fileState).toEqual('invalid');
    expect(el).toContainText('something is bad');
  });

});
