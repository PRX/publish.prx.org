import { Component, Input, DoCheck } from '@angular/core';
import { BaseModel } from '../model/base.model';

@Component({
  selector: 'publish-fancy-duration',
  styleUrls: ['fancy-field.component.css', 'fancy-duration.component.css'],
  template: `
    <div class="field small inline" [class.tiny]="tiny">
      <h4 *ngIf="label">
        <label [attr.for]="hoursName">{{label}}</label>
      </h4>
      <template [ngIf]="!model">
        <input [id]="hoursName" type="number" disabled=true/>
        <b>:</b>
        <input [id]="minutesName" type="number" disabled=true/>
        <b>:</b>
        <input [id]="secondsName" type="number" disabled=true/>
      </template>
      <template [ngIf]="model">
        <input [id]="hoursName" type="number" min="0" [ngModel]="hours"
          (ngModelChange)="set('hours', $event)" [class.changed]="hoursChanged"/>
        <b>:</b>
        <input [id]="minutesName" type="number" min="0" [ngModel]="minutes"
          (ngModelChange)="set('minutes', $event)" [class.changed]="minutesChanged"/>
        <b>:</b>
        <input [id]="secondsName" type="number" min="0" [ngModel]="seconds"
          (ngModelChange)="set('seconds', $event)" [class.changed]="secondsChanged"/>
      </template>
    </div>
  `
})

export class FancyDurationComponent implements DoCheck {

  @Input() model: BaseModel;
  @Input() name: string;
  @Input() label: string;
  @Input() tiny: boolean;

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  hoursName: string;
  minutesName: string;
  secondsName: string;
  hoursChanged: boolean;
  minutesChanged: boolean;
  secondsChanged: boolean;

  ngDoCheck() {
    this.hours = Math.floor(this.total / 3600);
    this.minutes = Math.floor(this.total % 3600 / 60);
    this.seconds = Math.floor(this.total % 3600 % 60);
    this.hoursName = (this.name || 'duration') + '-hours';
    this.minutesName = (this.name || 'duration') + '-minutes';
    this.secondsName = (this.name || 'duration') + '-seconds';
    this.hoursChanged = this.hours !== Math.floor(this.originalTotal / 3600);
    this.minutesChanged = this.minutes !== Math.floor(this.originalTotal % 3600 / 60);
    this.secondsChanged = this.seconds !== Math.floor(this.originalTotal % 3600 % 60);
  }

  get total(): number {
    return this.model[this.name] || 0;
  }

  get originalTotal(): number {
    return this.model.original[this.name] || 0;
  }

  set(type: string, value: number) {
    value = Math.max(value, 0);
    if (type === 'hours') {
      this.hours = value;
    } else if (type === 'minutes') {
      this.minutes = value;
    } else if (type === 'seconds') {
      this.seconds = value;
    }
    let total = this.hours * 3600 + this.minutes * 60 + this.seconds;
    this.model.set(this.name, total || null);
  }

}
