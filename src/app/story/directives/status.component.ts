import { Component, Input, DoCheck } from '@angular/core';
import { ModalService } from 'ngx-prx-styleguide';
import { StoryModel } from '../../shared';

export type StoryStatus = 'draft' | 'scheduled' | 'published';
@Component({
  selector: 'publish-story-status',
  styleUrls: ['status.component.css'],
  template: `
    <h2 [class]="currentStatus">{{currentStatus}}</h2>
    <dl>
      <dt>Status</dt>
      <dd>
        <select *ngIf="currentStatus !== 'published'; else published"
          [ngModel]="nextStatus"
          (ngModelChange)="statusChange($event)">
          <option *ngFor="let status of statusOptions"
                  [value]="status">{{status | titlecase}}</option>
        </select>
        <ng-template #published>Published</ng-template>
      </dd>

      <dt>Last Saved</dt>
      <dd *ngIf="!id">Not Saved</dd>
      <dd *ngIf="id">{{story.updatedAt | date: 'short'}}</dd>

      <dt>Dropdate</dt>
      <dd>
        <prx-tz-datepicker *ngIf="nextStatus !== 'published' || currentStatus === 'published'; else publishImmediately"
          [date]="date" (dateChange)="setDate($event)" [changed]="dateChanged">
        </prx-tz-datepicker>
        <ng-template #publishImmediately>Publish Immediately</ng-template>
      </dd>
    </dl>
    <publish-status-control
      [id]="id" [story]="story"
      [nextStatus]="nextStatus"
      [currentStatus]="currentStatus"
      (status)="statusChange($event)"></publish-status-control>
  `
})

export class StoryStatusComponent implements DoCheck {

  @Input() id: number;
  @Input() story: StoryModel;

  statusOptions = ['draft', 'scheduled', 'published'];
  currentStatus: StoryStatus;
  nextStatus: StoryStatus;

  constructor(private modal: ModalService) {}

  ngDoCheck() {
    if (this.story) {
      this.determineStatus();
    }
  }

  statusChange(status: StoryStatus) {
    this.nextStatus = status;
    if (this.currentStatus !== 'draft' && status === 'draft') {
      // clear publishedAt to unpublish scheduled episodes
      this.story.set('releasedAt', null);
    } else if (this.currentStatus !== 'scheduled' && status === 'scheduled' && !this.story.releasedAt) {
      // initialize releasedAt for scheduling
      this.story.set('releasedAt', new Date());
    } else if (this.currentStatus !== 'published' && status === 'published' && this.story.releasedAt) {
      // if set, clear releasedAt for publish now
      this.story.set('releasedAt', null);
    }
  }

  get date() {
    if (this.story && this.story.releasedAt) {
      return this.story.releasedAt;
    } else if (this.story && this.story.publishedAt && this.story.publishedAt.valueOf() <= new Date().valueOf()) {
      return this.story.publishedAt;
    }
  }

  setDate(date: Date) {
    if (this.story) {
      // set releasedAt, see CMS story model update_published_to_released
      this.story.set('releasedAt', date);
      // Legacy: This actually does nothing. Removing date from datepicker is not valid and does not emit change.
      // ...but if it did actually unset releasedAt, then we'd want to notify so keep
      if (this.nextStatus !== 'draft' && !date) {
        this.notifyOfCanceledPublication();
      }
    }
  }

  get dateChanged(): boolean {
    return this.story && this.story.changed('releasedAt', false);
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
