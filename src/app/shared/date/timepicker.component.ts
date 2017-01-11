import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'publish-timepicker',
  template: `
    <select
      [(ngModel)]="hour">
      <option *ngFor="let h of hourOptions" [value]="h">{{h}}</option>
    </select> :
    <select
      [(ngModel)]="minutes">
      <option *ngFor="let m of minuteOptions" [value]="m">{{m}}</option>
    </select>
  `/*,
  styleUrls: ['timepicker.component.css']*/
})

export class TimepickerComponent {
  @Input() date: Date;
  @Output() onTimeChange = new EventEmitter<Date>();
  hourOptions: string[] = new Array(24).fill('').map((x, i) => i < 10 ? '0' + i : '' + i);
  minuteOptions = ['00', '30'];

  get hour(): string {
    let date = this.date ? new Date(this.date.valueOf()) : new Date();
    if (date.getMinutes() <= 30) {
      return date.getHours() < 10 ? '0' + date.getHours() : '' + date.getHours();
    } else {
      return date.getHours() + 1 <= 23 ? '' + (date.getHours() + 1) : '00';
    }
  }

  set hour(hour: string) {
    let date = new Date(this.date.valueOf());
    date.setHours(Number(hour));
    this.onTimeChange.emit(date);
  }

  get minutes(): string {
    if (!this.date) {
      return '00';
    } else {
      let minutes = new Date(this.date.valueOf()).getMinutes();
      return minutes > 0 && minutes <= 30 ? '30' : '00';
    }
  }

  set minutes(minutes: string) {
    let date = new Date(this.date.valueOf());
    date.setMinutes(Number(minutes))
    this.onTimeChange.emit(date);
  }
}
