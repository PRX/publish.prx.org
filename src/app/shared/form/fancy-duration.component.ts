import { Component, Input, DoCheck } from '@angular/core';
import { BaseModel } from 'ngx-prx-styleguide';

@Component({
  selector: 'publish-fancy-duration',
  styleUrls: ['fancy-field.component.css', 'fancy-duration.component.css'],
  template: `
    <div class="field small inline" [class.tiny]="tiny">
      <h4 *ngIf="label">
        <label [attr.for]="hoursName">{{label}}</label>
      </h4>
      <ng-container *ngIf="!model">
        <input [id]="hoursName" type="number" disabled=true/>
        <b>:</b>
        <input [id]="minutesName" type="number" disabled=true/>
        <b>:</b>
        <input [id]="secondsName" type="number" disabled=true/>
      </ng-container>
      <ng-container *ngIf="model">
        <input [id]="hoursName" type="number" min="0" [ngModel]="hours | padzero"
          #hoursInput (click)="selectAllContent(hoursInput)"
          [prxAdvancedConfirm]="advancedConfirm" [prxName]="name" [prxModel]="model"
          (ngModelChange)="set('hours', $event)" [class.changed]="hoursChanged"/>
        <b>:</b>
        <input [id]="minutesName" type="number" min="0" [ngModel]="minutes | padzero"
          #minutesInput (click)="selectAllContent(minutesInput)"
          [prxAdvancedConfirm]="advancedConfirm" [prxName]="name" [prxModel]="model"
          (ngModelChange)="set('minutes', $event)" [class.changed]="minutesChanged"/>
        <b>:</b>
        <input [id]="secondsName" type="number" min="0" [ngModel]="seconds | padzero"
          #secondsInput (click)="selectAllContent(secondsInput)"
          [prxAdvancedConfirm]="advancedConfirm" [prxName]="name" [prxModel]="model"
          (ngModelChange)="set('seconds', $event)" [class.changed]="secondsChanged"/>
      </ng-container>
    </div>
  `
})

export class FancyDurationComponent implements DoCheck {

  @Input() model: BaseModel;
  @Input() name: string;
  @Input() label: string;
  @Input() tiny: boolean;
  @Input() advancedConfirm: string;

  hours = 0;
  minutes = 0;
  seconds = 0;
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
    this.model.set(this.name, total || 0);
  }

  selectAllContent(input: HTMLInputElement) {
    if (input.select) { input.select(); }
  }

}
