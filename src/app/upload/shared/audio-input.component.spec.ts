import { cit, create, provide } from '../../../testing';
import { AudioInputComponent } from './audio-input.component';
import { UploadService } from '../../core/upload/upload.service';

describe('AudioInputComponent', () => {

  create(AudioInputComponent);

  provide(UploadService, {add: () => null});

  cit('adds audio elements', (fix, el, comp) => {
    let file = new File(['blah'], 'blah.txt');
    comp.addFile(file);
    expect(comp.newFiles.length).toEqual(1);
    expect(comp.newFiles[0].checked).toEqual(false);
    expect(comp.newFiles[0].raw).toMatch(/^blob:/);
    expect(comp.newFiles[0].file).toEqual(file);
    fix.detectChanges();
    expect(el).toQuery('audio');
    comp.newFiles[0].checked = true;
    fix.detectChanges();
    expect(el).not.toQuery('audio');
  });

  cit('uploads single', (fix, el, comp) => {
    comp.multiple = false;
    fix.detectChanges();
    expect(el).toQueryAttr('input', 'multiple', 'false');
  });

  cit('uploads multiple', (fix, el, comp) => {
    comp.multiple = true;
    fix.detectChanges();
    expect(el).toQueryAttr('input', 'multiple', 'true');
  });

});
