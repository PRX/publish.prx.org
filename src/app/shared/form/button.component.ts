import { Component, Input, Output, EventEmitter } from '@angular/core';

import { BaseModel } from '../model/base.model';

@Component({
  selector: 'publish-button',
  styleUrls: ['button.component.css'],
  template: `
    <button *ngIf="isVisible" [disabled]="isDisabled" [class.working]="isWorking"
      [class.orange]="orange" [class.plain]="plain" [class.red]="red" [class.green]="green"
      (click)="onClick($event)">
      <ng-content></ng-content>
      <publish-spinner *ngIf="isWorking"></publish-spinner>
    </button>
    `
})

export class ButtonComponent {

  @Input() model: BaseModel;
  @Output() click = new EventEmitter<Event>();

  @Input() orange = false;
  @Input() plain = false;
  @Input() red = false;
  @Input() green = false;

  @Input() working: boolean;
  @Input() disabled: boolean;
  @Input() visible: boolean;

  get isWorking() {
    if (this.working === undefined) {
      return this.model.isSaving;
    } else {
      return this.decode(this.working);
    }
  }

  get isDisabled() {
    if (this.disabled === undefined) {
      return this.isWorking || this.model.invalid();
    } else {
      return this.decode(this.disabled);
    }
  }

  get isVisible() {
    if (this.visible === undefined) {
      return this.model.changed();
    } else {
      return this.decode(this.visible);
    }
  }

  onClick(event: Event) {
    event.stopPropagation();
    if (!this.isWorking) {
      this.click.emit(event);
    }
  }

  private decode(val: any): any {
    if (val === '0') {
      return 0;
    } else {
      return val;
    }
  }

}
