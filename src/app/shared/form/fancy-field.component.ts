import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseModel } from '../model/base.model';

const isset = (val: any): boolean => val !== false && val !== undefined;

@Component({
  selector: 'publish-fancy-field',
  styleUrls: ['fancy-field.component.css'],
  templateUrl: 'fancy-field.component.html'
})

export class FancyFieldComponent {

  @Input() model: BaseModel;
  @Output() onChange = new EventEmitter<any>();

  // Name of model attribute, and optional explicit changed/invalid bindings
  @Input() name: string;
  @Input() changed: string;
  @Input() invalid: string;
  @Input() label: string;
  @Input() invalidlabel: string;
  @Input() hideinvalid: boolean;
  @Input() advancedConfirm: string;
  @Input() strict: boolean;

  // Form field types (intercepted with defaults)
  type: string;
  _select: string[][];
  @Input()
  set textinput(any: any) { this.type = 'textinput'; }
  @Input()
  set number(any: any) { this.type = 'number'; }
  @Input()
  set textarea(any: any) { this.type = 'textarea'; }
  @Input()
  set select(opts: any) { this.type = 'select'; this.setOptions(opts); }
  get select() { return this._select; }

  // Field attributes
  _small = false;
  _inline = false;
  _required = null;
  @Input()
  set small(small: boolean) { this._small = isset(small); }
  get small() { return this._small; }
  @Input()
  set inline(inline: boolean) { this._inline = isset(inline); }
  get inline() { return this._inline; }
  @Input()
  set required(required: boolean) { this._required = isset(required) ? true : null; }
  get required() { return this._required; }

  get changedFieldName(): string {
    return (this.changed === undefined) ? this.name : this.changed;
  }

  get invalidFieldName(): string {
    return (this.invalid === undefined) ? this.name : this.invalid;
  }

  get invalidFieldLabel(): string {
    return (this.invalidlabel === undefined) ? this.label : this.invalidlabel;
  }

  get formattedInvalid(): string {
    if (this.invalidFieldName && this.model && this.hideinvalid === undefined) {
      let msg = this.model.invalid(this.invalidFieldName, this.strict);
      if (msg) {
        if (this.invalidFieldLabel) {
          msg = msg.replace(this.invalidFieldName, this.invalidFieldLabel);
        }
        return msg;
      }
    }
  }

  get fieldClasses(): string {
    let classes = ['field'];
    if (this.small) { classes.push('small'); }
    if (this.inline) { classes.push('inline'); }
    if (!this.model) { return classes.join(' '); }

    // explicit changed/invalid inputs get different classes
    let changed = this.changedFieldName && this.model.changed(this.changedFieldName);
    let invalid = this.invalidFieldName && this.model.invalid(this.invalidFieldName, this.strict);
    if (changed) {
      classes.push(this.name ? 'changed' : 'changed-explicit');
    }
    if (invalid) {
      classes.push(this.name ? 'invalid' : 'invalid-explicit');
    }
    return classes.join(' ');
  }

  doOnChange(value: any): void {
    if (this.name) {
      this.model.set(this.name, value);
    }
    this.onChange.emit(value);
  }

  // options can either be ['val1'] or [['display1', 'val1']]
  private setOptions(opts: string[]) {
    this._select = (opts || []).map(opt => {
      if (typeof opt === 'string') {
        return [opt, opt];
      } else {
        return opt;
      }
    });
  }

}
