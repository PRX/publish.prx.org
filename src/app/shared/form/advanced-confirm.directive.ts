import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import { ModalService } from '../../core';

export const AdvancedConfirmText = {
  newFeedUrl: function (changed, originalValue, changedValue) {
    if (changed) {
      let prompt = "Are you sure you want to change New Feed URL";
      if (originalValue) {
        prompt += ` from "${originalValue}"`;
      }
      if (changedValue) {
        prompt += ` to "${changedValue}"`;
      }
      prompt += '? This will point your subscribers to a new feed location.';
      return prompt;
    }
  }
};

export interface AdvancedConfirm {
  confirm: string;
  callback: Function;
}

@Directive({
  selector: '[publishAdvancedConfirm]'
})

export class AdvancedConfirmDirective implements Directive {
  @Input() publishAdvancedConfirm: AdvancedConfirm;

  @HostListener('blur') onMouseEnter() {
    if (this.publishAdvancedConfirm && this.publishAdvancedConfirm.confirm) {
      this.modal.prompt('', this.publishAdvancedConfirm.confirm, this.publishAdvancedConfirm.callback);
    }
  }

  constructor(private el: ElementRef,
              private modal: ModalService) {}
}
