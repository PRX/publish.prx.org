import { cit, create, By } from '../../../testing';
import { FreeUploadComponent } from './free-upload.component';

describe('FreeUploadComponent', () => {

  create(FreeUploadComponent, false);

  cit('renders a movable uploaded file', (fix, el, comp) => {
    comp.file = {
      label: 'Mylabel',
      filename: 'Thefile.name',
      changed: () => false,
      invalid: () => false
    };
    fix.detectChanges();
    expect(el).toQueryAttr('input', 'value', 'Mylabel');
    expect(el).toContainText('Thefile.name');
    expect(el).toQuery('.icon-menu');
    expect(el).toQuery('.icon-cancel');
  });

  cit('has an editable label', (fix, el, comp) => {
    comp.file = {
      label: 'Mylabel',
      filename: 'Thefile.name',
      changed: () => false,
      invalid: () => false,
      set: (k, v) => comp.file[k] = v
    };
    fix.detectChanges();
    let input = el.query(By.css('input')).nativeElement;
    input.value = 'New value';
    input.dispatchEvent(new Event('input'));
    fix.detectChanges();
    expect(comp.file.label).toEqual('New value');
    expect(el).toQueryAttr('input', 'value', 'New value');
  });

});
