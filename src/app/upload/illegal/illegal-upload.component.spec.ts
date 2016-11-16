import { cit, create } from '../../../testing';
import { IllegalUploadComponent } from './illegal-upload.component';

describe('IllegalUploadComponent', () => {

  create(IllegalUploadComponent, false);

  cit('renders a placeholder for an illegal file', (fix, el, comp) => {
    comp.file = {label: 'Mylabel', filename: 'Thefile.name'};
    fix.detectChanges();
    expect(el).toContainText('Mylabel');
    expect(el).toContainText('Thefile.name');
    expect(el).toContainText('Segment not in template');
    expect(el).toQuery('.icon-cancel');
  });

});
