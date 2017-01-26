import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'publish-timepicker',
  template: `
    <select [class.changed]="changed"
      [ngModel]="time" (ngModelChange)="set($event)">
      <option *ngFor="let o of options" [value]="o">{{o}}</option>
    </select>
  `,
  styleUrls: ['timepicker.component.css']
})

export class TimepickerComponent {
  @Input() date: Date;
  @Output() onTimeChange = new EventEmitter<Date>();
  @Input() changed: boolean;

  localTimezone = new Date().toString().match(/(\([A-Za-z\s].*\))/)[1];
  options: string[] = [
    '12:00am ' + this.localTimezone,
    '12:30am ' + this.localTimezone,
    '1:00am ' + this.localTimezone,
    '1:30am ' + this.localTimezone,
    '2:00am ' + this.localTimezone,
    '2:30am ' + this.localTimezone,
    '3:00am ' + this.localTimezone,
    '3:30am ' + this.localTimezone,
    '4:00am ' + this.localTimezone,
    '4:30am ' + this.localTimezone,
    '5:00am ' + this.localTimezone,
    '5:30am ' + this.localTimezone,
    '6:00am ' + this.localTimezone,
    '6:30am ' + this.localTimezone,
    '7:00am ' + this.localTimezone,
    '7:30am ' + this.localTimezone,
    '8:00am ' + this.localTimezone,
    '8:30am ' + this.localTimezone,
    '9:00am ' + this.localTimezone,
    '9:30am ' + this.localTimezone,
    '10:00am ' + this.localTimezone,
    '10:30am ' + this.localTimezone,
    '11:00am ' + this.localTimezone,
    '11:30am ' + this.localTimezone,
    '12:00pm ' + this.localTimezone,
    '12:30pm ' + this.localTimezone,
    '1:00pm ' + this.localTimezone,
    '1:30pm ' + this.localTimezone,
    '2:00pm ' + this.localTimezone,
    '2:30pm ' + this.localTimezone,
    '3:00pm ' + this.localTimezone,
    '3:30pm ' + this.localTimezone,
    '4:00pm ' + this.localTimezone,
    '4:30pm ' + this.localTimezone,
    '5:00pm ' + this.localTimezone,
    '5:30pm ' + this.localTimezone,
    '6:00pm ' + this.localTimezone,
    '6:30pm ' + this.localTimezone,
    '7:00pm ' + this.localTimezone,
    '7:30pm ' + this.localTimezone,
    '8:00pm ' + this.localTimezone,
    '8:30pm ' + this.localTimezone,
    '9:00pm ' + this.localTimezone,
    '9:30pm ' + this.localTimezone,
    '10:00pm ' + this.localTimezone,
    '10:30pm ' + this.localTimezone,
    '11:00pm ' + this.localTimezone,
    '11:30pm ' + this.localTimezone
  ];

  roundMinutes(value: number): string {
    return value > 0 && value <= 30 ? '30' : '00';
  }

  convert24to12Hours(hours: number): number {
    return hours % 12 === 0 ? 12 : hours % 12;
  }

  amPm(hours: number): string {
    return hours < 12 ? 'am' : 'pm';
  }

  dateToHumanTime(date: Date): string {
    return this.convert24to12Hours(date.getHours()) + ':' +
      this.roundMinutes(date.getMinutes()) +
      this.amPm(date.getHours()) +
      ' ' + this.localTimezone;
  }

  get time(): string {
    if (this.date) {
      return this.dateToHumanTime(new Date(this.date.valueOf()));
    }
  }

  set(value:string) {
    let date = this.date ? new Date(this.date.valueOf()) : new Date();
    let hours = +value.split(':')[0];
    if (hours < 12 && value.substr(value.indexOf(':') + 3, 2) === 'pm') {
      hours += 12;
    } else if (hours === 12 && value.slice(value.length - 2) === 'am') {
      hours = 0;
    }
    date.setHours(hours);
    date.setMinutes(+value.substr(value.indexOf(':') + 1, 2));
    this.onTimeChange.emit(date);
  }
}
