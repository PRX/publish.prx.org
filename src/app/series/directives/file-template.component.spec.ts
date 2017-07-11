import { cit, create, provide, stubPipe } from '../../../testing';
import { ModalService } from 'ngx-prx-styleguide';
import { AudioFileTemplateModel } from '../../shared';
import { FileTemplateComponent } from './file-template.component';

describe('FileTemplateComponent', () => {

  create(FileTemplateComponent);

  provide(ModalService);

  stubPipe('capitalize');
  stubPipe('duration');

  cit('renders undestroyed file templates', (fix, el, comp) => {
    expect(el).not.toQuery('prx-fancy-field');
    comp.file = new AudioFileTemplateModel(null);
    comp.file.isDestroy = true;
    fix.detectChanges();
    expect(el).not.toQuery('prx-fancy-field');
    comp.file.isDestroy = false;
    fix.detectChanges();
    expect(el).toQuery('prx-fancy-field');
  });

  cit('only allows removing the last template in a version', (fix, el, comp) => {
    comp.file = new AudioFileTemplateModel(null);
    comp.version = {fileTemplates: [{}, comp.file, {}]};
    fix.detectChanges();
    expect(el).not.toQuery('.icon-cancel');
    comp.version = {fileTemplates: [{}, comp.file, {isDestroy: true}]};
    fix.detectChanges();
    expect(el).toQuery('.icon-cancel');
  });

  cit('shows label and length validation errors', (fix, el, comp) => {
    comp.file = new AudioFileTemplateModel(null);
    fix.detectChanges();
    expect(el).toContainText('label is a required field');
    comp.file.set('label', 'foobar');
    fix.detectChanges();
    expect(el).not.toQuery('.error');
    comp.file.set('lengthMinimum', 100);
    comp.file.set('lengthMaximum', 50);
    fix.detectChanges();
    expect(el).toContainText('must be less than');
  });

});
