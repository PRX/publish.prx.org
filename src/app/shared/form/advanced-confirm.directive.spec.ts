import { cit, create, direct, provide, By } from '../../../testing';
import { Component } from '@angular/core';
import { ModalService } from '../../core';
import { AdvancedConfirmDirective } from './advanced-confirm.directive';

@Component({
  template: '<input [publishAdvancedConfirm]="confirmText" [advancedModel]="model" [advancedFieldName]="name"/>'
})
class MyComponent {
  confirmText: string;
  model: any;
  fieldName: string;
}
const getDirective = (el): AdvancedConfirmDirective => {
  let inputEl = el.query(By.directive(AdvancedConfirmDirective));
  expect(inputEl).toBeDefined();
  return inputEl.injector.get(AdvancedConfirmDirective);
};

describe('AdvancedConfirmDirective', () => {

  create(MyComponent, false);

  direct(AdvancedConfirmDirective);

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
    fix.detectChanges();

    let advancedConfirm = getDirective(el);
    advancedConfirm.onBlur();
    expect(modalAlertMessage).toEqual(comp.confirmText);
  });

});
