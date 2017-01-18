import { Directive, Input, HostListener } from '@angular/core';
import { ModalService } from '../../core';
import { BaseModel } from '../model/base.model';

@Directive({
  selector: '[publishAdvancedConfirm]'
})

export class AdvancedConfirmDirective implements Directive {
  @Input() fieldName: string;
  @Input() model: BaseModel;
  @Input('publishAdvancedConfirm') confirmText: string;

  @HostListener('blur') onBlur() {
    if (this.confirmText && !this.model.isNew && !this.model.invalid(this.fieldName) && this.model.changed(this.fieldName)) {
      this.modal.prompt('', this.confirmText, this.resetFieldOnCancel.bind(this));
    }
  }

  constructor(private modal: ModalService) {}

  resetFieldOnCancel(confirm) {
    if (!confirm) {
      this.model.set(this.fieldName, this.model.original[this.fieldName]);
    }
  }
}
