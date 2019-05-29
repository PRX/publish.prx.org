import { Component, Input, DoCheck } from '@angular/core';
import { ModalService } from 'ngx-prx-styleguide';
import { StoryModel } from '../../shared';

export type StoryStatus = 'draft' | 'scheduled' | 'published';
@Component({
  selector: 'publish-story-status',
  styleUrls: ['status.component.css'],
  template: `
    <h1 [class]="currentStatus">{{currentStatus}}</h1>
    <ng-container *ngIf="false">
      <dd *ngIf="isPublished"><p>{{story.publishedAt | date:"short"}}</p></dd>
      <dd *ngIf="isReleased && !isPublished"><p>{{story.releasedAt | date:"short"}}</p></dd>
      <dd *ngIf="id"><p *ngIf="story?.updatedAt">{{story.updatedAt | date:"short"}}</p></dd>
    </ng-container>
    <dl *ngIf="story">
      <dt>Status</dt>
      <dd>
        <select (change)="statusChange($event.target.value)">
          <option *ngFor="let status of statusOptions"
                  [value]="status"
                  [selected]="status === currentStatus">{{status | titlecase}}</option>
        </select>
      </dd>
      <dt>Dropdate</dt>
      <dd>
        <prx-tz-datepicker
          [date]="story.releasedAt" (dateChange)="setDate($event)" [changed]="story.changed('releasedAt', false)">
        </prx-tz-datepicker>
      </dd>
    </dl>
    <publish-status-control [id]="id" [story]="story" [nextStatus]="nextStatus"></publish-status-control>
  `
})

export class StoryStatusComponent implements DoCheck {

  @Input() id: number;
  @Input() story: StoryModel;

  statusOptions = ['draft', 'scheduled', 'published'];
  currentStatus: StoryStatus;
  nextStatus: StoryStatus;

  isPublished: boolean;
  isReleased: boolean;
  isScheduled: boolean;

  isPublishing: boolean;

  constructor(private modal: ModalService) {}

  ngDoCheck() {
    if (this.story) {
      this.determineStatus();
      this.isReleased = this.story.releasedAt ? true : false;
      this.isScheduled = this.isPublished && !this.story.isPublished();
    }
  }

  statusChange(status: StoryStatus) {
    this.nextStatus = status;
  }

  setDate(date: Date) {
    if (this.story) {
      this.story.set('releasedAt', date); // always sets releasedAt, see CMS story model update_published_to_released
      if (!date) {
        this.notifyOfCanceledPublication();
      }
    }
  }

  notifyOfCanceledPublication() {
    const futurePublished = this.story.publishedAt && new Date() < this.story.publishedAt;
    const removingReleaseDate = this.story.changed('releasedAt') && !this.story.releasedAt;
    if (removingReleaseDate && futurePublished) {
      this.modal.alert(
        '',
        'Removing the scheduled release date for a published episode will unpublish the episode.',
        () => {}
      );
    }
  }

  determineStatus() {
    if (this.story.isNew || !this.story.publishedAt) {
      this.currentStatus = 'draft';
    } else if (!this.story.isPublished()) {
      this.currentStatus = 'scheduled';
    } else {
      this.currentStatus = 'published';
    }
    if (!this.nextStatus) { this.nextStatus = this.currentStatus }
  }
}
