import { Directive, Input, HostListener } from '@angular/core';
import { ModalService } from '../../core';
import { BaseModel } from '../model/base.model';

@Directive({
  selector: '[publishAdvancedConfirm]'
})

export class AdvancedConfirmDirective implements Directive {

  @Input() publishAdvancedConfirm: string;
  @Input() publishModel: BaseModel;
  @Input() publishName: string;
  @Input() publishEvent = 'blur';

  @HostListener('blur') onBlur() { return this.publishEvent === 'blur' && this.confirm(); }
  @HostListener('change') onChange() { return this.publishEvent === 'change' && this.confirm(); }

  constructor(private modal: ModalService) {}

  confirm() {
    if (this.publishAdvancedConfirm && this.shouldConfirm()) {
      this.modal.confirm('', this.publishAdvancedConfirm, this.resetFieldOnCancel.bind(this));
    }
  }

  shouldConfirm(): boolean {
    return (this.publishModel && this.publishName)
      && !this.publishModel.isNew
      && !this.publishModel.invalid(this.publishName)
      && this.publishModel.changed(this.publishName);
  }

  resetFieldOnCancel(confirm) {
    if (!confirm) {
      this.publishModel.set(this.publishName, this.publishModel.original[this.publishName]);
    }
  }
}
