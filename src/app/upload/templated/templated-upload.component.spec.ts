import { cit, create, stubPipe } from '../../../testing';
import { TemplatedUploadComponent } from './templated-upload.component';

describe('TemplatedUploadComponent', () => {

  create(TemplatedUploadComponent, false);

  stubPipe('duration');

  cit('renders a file', (fix, el, comp) => {
    comp.file = {label: 'Mylabel', filename: 'Thefile.name'};
    fix.detectChanges();
    expect(el).toContainText('Mylabel');
    expect(el).toContainText('Thefile.name');
    expect(el).toQuery('.icon-cancel');
  });

  cit('renders a template', (fix, el, comp) => {
    comp.template = {label: 'Tpl Label'};
    fix.detectChanges();
    expect(el).toContainText('Tpl Label');
    expect(el).not.toQuery('.icon-cancel');
    expect(el).toQuery('publish-audio-input');
  });

  cit('shows template duration requirements', (fix, el, comp) => {
    comp.template = {lengthMinimum: 3, lengthMaximum: 5};
    fix.detectChanges();
    expect(el).toContainText('Length between 3 and 5');
    comp.template = {lengthMinimum: 3};
    fix.detectChanges();
    expect(el).toContainText('Length greater than 3');
    comp.template = {lengthMaximum: 5};
    fix.detectChanges();
    expect(el).toContainText('Length less than 5');
  });

  cit('hides destroyed files', (fix, el, comp) => {
    comp.file = {label: 'thefile'};
    comp.template = {label: 'thetemplate'};
    fix.detectChanges();
    expect(el).toContainText('thefile');
    expect(el).not.toContainText('thetemplate');
    comp.file.isDestroy = true;
    fix.detectChanges();
    expect(el).not.toContainText('thefile');
    expect(el).toContainText('thetemplate');
  });

});
