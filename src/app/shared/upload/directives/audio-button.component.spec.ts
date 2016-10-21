import { cit, create } from '../../../../testing';
import { AudioButtonComponent } from './audio-button.component';

describe('AudioButtonComponent', () => {

  create(AudioButtonComponent);

  cit('checks playability', (fix, el, comp) => {
    let file: any = {};
    spyOn(URL, 'createObjectURL').and.returnValue('');
    comp.addFile(file);
    expect(comp.newFiles.length).toEqual(1);
    expect(comp.newFiles[0].checked).toEqual(false);
    expect(comp.newFiles[0].raw).toEqual('');
    expect(comp.newFiles[0].file).toEqual(file);

    fix.detectChanges();
    expect(el).toQuery('audio');
  });

});
