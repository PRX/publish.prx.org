import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'publish-timepicker',
  template: `
    <input [class.changed]="changed" type="number" min="0" max="24" 
      [ngModel]="hour | padzero" (ngModelChange)="set('hour', $event)">
    <span class="separator">:</span>
    <input [class.changed]="changed" type="number" min="0" max="30" step="30"
      [ngModel]="minutes | padzero" (ngModelChange)="set('minutes', $event)">
  `,
  styleUrls: ['timepicker.component.css']
})

export class TimepickerComponent {
  @Input() date: Date;
  @Output() onTimeChange = new EventEmitter<Date>();
  @Input() changed: boolean;

  get hour(): number {
    if (this.date) {
      let date = new Date(this.date.valueOf());
      if (date.getMinutes() <= 30) {
        return date.getHours();
      } else {
        return date.getHours() + 1 <= 23 ? (date.getHours() + 1) : 0;
      }
    }
  }

  get minutes(): number {
    if (this.date) {
      return this.roundMinutes(new Date(this.date.valueOf()).getMinutes());
    }
  }

  roundMinutes(value) {
    return value > 0 && value <= 30 ? 30 : 0;
  }

  set(field: string, value: number) {
    let date = this.date ? new Date(this.date.valueOf()) : new Date();
    if (field === 'hour') {
      date.setHours(value);
      if (!this.date) {
        date.setMinutes(0);
      }
    } else if (field === 'minutes') {
      date.setMinutes(this.roundMinutes(value));
    }
    this.onTimeChange.emit(date);
  }
}
