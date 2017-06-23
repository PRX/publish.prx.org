import { cit, create, By } from '../../../testing';
import { ButtonComponent } from './button.component';

class MockModel {
  isSaving = false;
  isInvalid = false;
  isChanged = false;
  invalid() { return this.isInvalid; }
  changed() { return this.isChanged; }
  constructor(opts: any = {}) {
    this.isSaving = opts.saving || false;
    this.isInvalid = opts.invalid || false;
    this.isChanged = opts.changed || false;
  }
}

describe('ButtonComponent', () => {

  create(ButtonComponent, false);

  cit('hides, disables and is not working by default', (fix, el, comp) => {
    comp.model = new MockModel();
    fix.detectChanges();
    expect(el).not.toQuery('button');
    comp.visible = true;
    fix.detectChanges();
    expect(el).toQuery('button');
    expect(el).not.toQueryAttr('button', 'disabled', '');
    expect(el).not.toQuery('button.working');
    expect(el).not.toQuery('prx-spinner');
  });

  describe('visible', () => {

    cit('is hidden by default', (fix, el, comp) => {
      comp.model = new MockModel();
      fix.detectChanges();
      expect(el).not.toQuery('button');
    });

    cit('is shown when changed', (fix, el, comp) => {
      comp.model = new MockModel({changed: true});
      fix.detectChanges();
      expect(el).toQuery('button');
    });

    cit('can override visibility', (fix, el, comp) => {
      comp.model = new MockModel();
      comp.visible = true;
      fix.detectChanges();
      expect(el).toQuery('button');
    });

  });

  describe('disabled', () => {

    cit('is disabled when saving', (fix, el, comp) => {
      comp.model = new MockModel({changed: true, saving: true});
      fix.detectChanges();
      expect(el).toQueryAttr('button', 'disabled', '');
    });

    cit('is disabled when invalid', (fix, el, comp) => {
      comp.model = new MockModel({changed: true, invalid: true});
      fix.detectChanges();
      expect(el).toQueryAttr('button', 'disabled', '');
    });

    cit('is disabled when working', (fix, el, comp) => {
      comp.model = new MockModel({changed: true});
      comp.working = true;
      fix.detectChanges();
      expect(el).toQueryAttr('button', 'disabled', '');
    });

    cit('can override disabled', (fix, el, comp) => {
      comp.model = new MockModel({changed: true});
      comp.disabled = true;
      fix.detectChanges();
      expect(el).toQueryAttr('button', 'disabled', '');
    });

  });

  describe('working', () => {

    cit('shows working indicators when saving', (fix, el, comp) => {
      comp.model = new MockModel({changed: true, saving: true});
      fix.detectChanges();
      expect(el).toQuery('button.working');
      expect(el).toQuery('prx-spinner');
    });

    cit('can override working', (fix, el, comp) => {
      comp.model = new MockModel({changed: true});
      comp.working = true;
      fix.detectChanges();
      expect(el).toQuery('button.working');
      expect(el).toQuery('prx-spinner');
    });

    cit('prevents double click resulting in double submit when working', (fix, el, comp) => {
      spyOn(comp.click, 'emit');
      comp.model = new MockModel({changed: true});
      comp.working = false;
      fix.detectChanges();
      el.query(By.css('button')).nativeElement.click();
      comp.working = true;
      fix.detectChanges();
      el.query(By.css('button')).nativeElement.click();
      expect(comp.click.emit).toHaveBeenCalledTimes(1);
    });

  });

});
