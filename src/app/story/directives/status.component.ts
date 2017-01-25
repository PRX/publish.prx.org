import { Component, Input, DoCheck } from '@angular/core';
import { ModalService } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-status',
  styleUrls: ['status.component.css'],
  template: `
    <h1>Publish</h1>
    <dl>

      <dt>Status</dt>
      <dd><span [class]="statusClass">{{statusText}}</span></dd>

      <dt *ngIf="id">Valid</dt>
      <dd *ngIf="id">
        <p *ngIf="notPublished && !normalInvalid">Yes</p>
        <button *ngIf="notPublished && normalInvalid" class="btn-link error"
          (click)="showProblems(normalInvalid)">No</button>
        <p *ngIf="isPublished && !strictInvalid">Yes</p>
        <button *ngIf="isPublished && strictInvalid" class="btn-link error"
          (click)="showProblems(strictInvalid)">No</button>
      </dd>

      <dt *ngIf="isPublished && isScheduled">Publishing</dt>
      <dt *ngIf="isPublished && !isScheduled">Publishing</dt>
      <dd *ngIf="isPublished"><p>{{story.publishedAt | date:"short"}}</p></dd>

      <dt>Saved</dt>
      <dd *ngIf="!id">Not Saved</dd>
      <dd *ngIf="id"><p *ngIf="story?.updatedAt">{{story.updatedAt | date:"short"}}</p></dd>

      <dt *ngIf="id && !story?.isPublished">Progress</dt>
      <dd *ngIf="id && !story?.isPublished">
        <template [ngIf]="notPublished && strictInvalid">
          <p>Not ready to publish</p>
          <button (click)="showProblems(strictInvalid, 'Not ready to publish')"
            class="btn-link">Found {{strictInvalidCount}}</button>
        </template>
        <template [ngIf]="notPublished && !strictInvalid">
          <p *ngIf="changed">Ready after save</p>
          <p *ngIf="!changed">Ready to publish</p>
          <publish-button [model]="story" visible=1 orange=1 [disabled]="changed"
            [working]="isPublishing" (click)="togglePublish()">Publish</publish-button>
        </template>
      </dd>

    </dl>
  `
})

export class StoryStatusComponent implements DoCheck {

  @Input() id: number;
  @Input() story: StoryModel;

  statusClass: string;
  statusText: string;
  isPublished: boolean;
  isScheduled: boolean;
  notPublished: boolean;

  normalInvalid: string;
  normalInvalidCount: string;
  strictInvalid: string;
  strictInvalidCount: string;
  changed: boolean;
  isPublishing: boolean;

  constructor(private modal: ModalService) {}

  ngDoCheck() {
    if (this.story) {
      this.setStatus();
      this.isPublished = this.story.publishedAt ? true : false;
      this.isScheduled = this.story.isPublished();
      this.notPublished = !this.isPublished;
      this.normalInvalid = this.story.invalid(null, false);
      this.normalInvalidCount = this.countProblems(this.normalInvalid);
      this.strictInvalid = this.story.invalid(null, true);
      this.strictInvalidCount = this.countProblems(this.strictInvalid);
      this.changed = this.story.changed();
    }
  }

  setStatus() {
    if (this.story.isNew) {
      this.statusClass = 'status new';
      this.statusText = 'New';
    } else if (!this.story.publishedAt) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (!this.story.isPublished()) {
      this.statusClass = 'status scheduled';
      this.statusText = 'Scheduled';
    } else {
      this.statusClass = 'status published';
      this.statusText = 'Published';
    }
  }

  formatInvalid(str: string) {
    str = str.trim();
    str = str.replace(/shortdescription/i, 'teaser');
    str = str.charAt(0).toUpperCase() + str.slice(1);
    return str;
  }

  countProblems(invalids: string, singular = 'problem', plural = 'problems') {
    let count = invalids ? invalids.split(',').length : 0;
    return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
  }

  showProblems(invalids: string, title = 'Validation errors') {
    let items = invalids.split(',').map(s => '<li>' + this.formatInvalid(s) + '</li>').join('');
    this.modal.show({title: title, body: `<ul>${items}</ul>`, buttons: ['Okay']});
  }

  togglePublish() {
    this.isPublishing = true;
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      this.isPublishing = false;
    });
  }

}
