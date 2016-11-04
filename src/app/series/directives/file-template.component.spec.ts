import { cit, create } from '../../../testing';
import { FileTemplateComponent } from './file-template.component';

describe('FileTemplateComponent', () => {

  create(FileTemplateComponent);

  cit('renders undestroyed file templates', (fix, el, comp) => {
    expect(el).not.toQuery('publish-fancy-field');
    comp.file = {isDestroy: true};
    fix.detectChanges();
    expect(el).not.toQuery('publish-fancy-field');
    comp.file = {isDestroy: false};
    fix.detectChanges();
    expect(el).toQuery('publish-fancy-field');
  });

});
