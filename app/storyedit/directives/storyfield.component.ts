import {Component, Input} from 'angular2/core';
import {NgForm} from 'angular2/common';
import {StoryModel} from '../models/story.model';

@Component({
  directives: [NgForm],
  selector: 'story-field',
  styleUrls: ['app/storyedit/directives/storyfield.component.css'],
  template: `
    <div [class]="fieldClasses" [class.small]="small">
      <h3 *ngIf="label && !small">
        <label [attr.for]="name" [attr.required]="required">{{label}}</label>
      </h3>
      <h4 *ngIf="label && small">
        <label [attr.for]="name" [attr.required]="required">{{label}}</label>
      </h4>

      <p class="hint"><ng-content select="hint"></ng-content></p>

      <div class="nested">
        <ng-content></ng-content>
      </div>

      <input *ngIf="textinput" [id]="name" type="text"
        [(ngModel)]="story[name]" (ngModelChange)="onChange($event)"/>

      <textarea *ngIf="textarea" [id]="name"
        [(ngModel)]="story[name]" (ngModelChange)="onChange($event)"></textarea>

      <select *ngIf="select" [id]="name"
        [(ngModel)]="story[name]" (ngModelChange)="onChange($event)">
        <option *ngFor="let opt of select" [value]="opt">{{opt}}</option>
      </select>

      <p *ngIf="invalidFieldName && !small" class="error">
        {{invalidFieldLabel}} {{story.invalid(invalidFieldName)}}
      </p>
    </div>
  `
})

export class StoryFieldComponent {

  @Input() story: StoryModel;

  // Name of story attribute, and optional explicit changed/invalid bindings
  @Input() name: string;
  @Input() changed: string;
  @Input() invalid: string;

  // Form field options
  @Input() textinput: boolean;
  @Input() textarea: boolean;
  @Input() select: string[];
  @Input() label: string;
  @Input() invalidlabel: string;
  @Input() small: boolean;
  @Input() required: boolean;

  get changedFieldName(): string {
    return (this.changed === undefined) ? this.name : this.changed;
  }

  get invalidFieldName(): string {
    return (this.invalid === undefined) ? this.name : this.invalid;
  }

  get invalidFieldLabel(): string {
    return (this.invalidlabel === undefined) ? this.label : this.invalidlabel;
  }

  get fieldClasses(): string {
    let classes = ['field'];
    let changed = this.changedFieldName && this.story.changed(this.changedFieldName);
    let invalid = this.invalidFieldName && this.story.invalid(this.invalidFieldName);

    // explicit changed/invalid inputs get different classes
    if (changed) {
      classes.push(this.name ? 'changed' : 'changed-explicit');
    }
    if (invalid) {
      classes.push(this.name ? 'invalid' : 'invalid-explicit');
    }
    return classes.join(' ');
  }

  onChange(value: any): void {
    if (this.name) {
      this.story.set(this.name, value);
    }
  }

}
