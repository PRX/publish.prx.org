import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as Pikaday from 'pikaday';
import * as moment from 'moment';

@Component({
  selector: 'publish-datepicker',
  template: `
    <span class="input-group">
      <input type="text" #datepicker [value]="formattedDate" [class.changed]="changed">
      <span class="input-group-addon" (click)="datepicker.click()"><i class="icon-calendar"></i></span>
    </span>
  `,
  styleUrls: ['datepicker.component.css']
})

export class DatepickerComponent implements AfterViewInit {
  public static FORMAT = 'MM/DD/YYYY';

  @Input() date: Date;
  @Output() onDateChange = new EventEmitter<Date>();
  @Input() changed: boolean;
  @ViewChild('datepicker') input: ElementRef;

  private picker: Pikaday;

  get formattedDate(): string {
    if (this.date) {
      return moment(this.date.valueOf()).format(DatepickerComponent.FORMAT);
    } else {
      return '';
    }
  }

  ngAfterViewInit() {
    let options = {
      field: this.input.nativeElement,
      format: DatepickerComponent.FORMAT,
      theme: 'triangle-theme',
      onSelect: () => {
        this.onDateChange.emit(this.picker.getDate());
      }
    };
    if (this.date) {
      options['defaultDate'] = new Date(this.date.valueOf());
      options['setDefaultDate'] = true;
    }
    this.picker = new Pikaday(options);
  }
}
