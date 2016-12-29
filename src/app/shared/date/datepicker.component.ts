import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as Pikaday from 'pikaday';
import * as moment from 'moment';

@Component({
  selector: 'publish-datepicker',
  template: `<input type="text" #datepicker [value]="formattedDate">`
})

export class DatepickerComponent implements AfterViewInit{
  public static FORMAT = 'MM/DD/YYYY';

  @Input() date: Date;
  @Output() onDateChange = new EventEmitter<Date>();
  @ViewChild('datepicker') input: ElementRef;

  private picker: Pikaday;

  get formattedDate(): string {
    if (this.date) {
      return moment(this.date.valueOf()).format(DatepickerComponent.FORMAT);
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
      // publishedAt is declared as a Date. why is it a string?
      let defaultDate = new Date(this.date.valueOf());
      options['defaultDate'] = (defaultDate.getMonth() + 1) + '/' + defaultDate.getDate() + '/' + defaultDate.getFullYear();
      options['setDefaultDate'] = true;
    }
    this.picker = new Pikaday(options);
  }
}
