import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as Pikaday from 'pikaday';

@Component({
  selector: 'publish-datepicker',
  template: `<input type="text" #datepicker [value]="date">`
})

export class DatepickerComponent implements AfterViewInit{
  @Input() date: Date;
  @Output() onDateChange = new EventEmitter<Date>();
  @ViewChild('datepicker') input: ElementRef;
  private picker: Pikaday;

  ngAfterViewInit() {
    this.picker = new Pikaday({
      field: this.input.nativeElement,
      onSelect: () => {
        this.onDateChange.emit(this.picker.getDate());
      }
    });
  }
}
