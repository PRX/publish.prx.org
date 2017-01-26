import { cit, contain, provide, By } from '../../../testing';
import { ModalService } from '../../core';
import { AdvancedConfirmDirective } from './advanced-confirm.directive';

describe('AdvancedConfirmDirective', () => {

  contain(AdvancedConfirmDirective, {
    template: `
      <input [publishAdvancedConfirm]="confirmText" [publishModel]="model"
        [publishName]="fieldName" [publishEvent]="eventName"/>
    `
  });

  let modalAlertMessage: any;
  beforeEach(() => modalAlertMessage = null);
  provide(ModalService, {
    prompt: (title, message, callback) => modalAlertMessage = message
  });

  cit('forces user to confirm changes to advanced fields', (fix, el, comp) => {
    comp.confirmText = 'some warning';
    comp.model = {
      isNew: false,
      changed: () => true,
      invalid: () => false
    };
    comp.fieldName = 'fieldName';
    comp.eventName = 'blur';
    fix.detectChanges();

    let advancedConfirm = el.query(By.css('input'));
    advancedConfirm.nativeElement.focus();
    advancedConfirm.nativeElement.blur();
    expect(modalAlertMessage).toEqual(comp.confirmText);
  });

  cit('can also trigger on the change event', (fix, el, comp) => {
    comp.confirmText = 'some warning';
    comp.model = {
      isNew: false,
      changed: () => true,
      invalid: () => false
    };
    comp.fieldName = 'fieldName';
    comp.eventName = 'change';
    fix.detectChanges();

    let advancedConfirm = el.query(By.css('input'));
    advancedConfirm.nativeElement.focus();
    advancedConfirm.nativeElement.blur();
    expect(modalAlertMessage).toBeNull();

    // creating events is tricky!
    let e = document.createEvent('HTMLEvents');
    e.initEvent('change', false, true);
    advancedConfirm.nativeElement.dispatchEvent(e);
    expect(modalAlertMessage).toEqual(comp.confirmText);
  });

});
