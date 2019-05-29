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
    <dl>
      <dt>Status</dt>
      <dd>
        <select (change)="statusChange($event.target.value)">
          <option *ngFor="let status of statusOptions"
                  [value]="status"
                  [selected]="status === currentStatus">{{status | titlecase}}</option>
        </select>
      </dd>
      <dt>Release</dt>
      <dd>
        <input type="checkbox" [ngModel]="showReleasedAt" (click)="toggleShowReleaseAt()" name="showReleasedAt" id="showReleasedAt">
        <label for="showReleasedAt">Specify date and time to be published</label>
        <div class="fancy-hint" *ngIf="showReleasedAt">If you'd like to manually alter this episode's publication
        to either delay or back-date its release, select the desired release date and time here.
        Otherwise, the episode will be released immediately once published.
        </div>
        <prx-tz-datepicker *ngIf="showReleasedAt"
          [date]="story.releasedAt" (dateChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
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
  showReleasedAt: boolean;

  isPublishing: boolean;

  constructor(private modal: ModalService) {}

  ngDoCheck() {
    if (this.story) {
      this.determineStatus();
      this.isReleased = this.story.releasedAt ? true : false;
      this.isScheduled = this.isPublished && !this.story.isPublished();
      if (this.story && this.story.releasedAt) {
        this.showReleasedAt = true;
      } else {
        this.showReleasedAt = false
      }
    }
  }

  statusChange(status: StoryStatus) {
    this.nextStatus = status;
  }

  get releasedAtChanged(): boolean {
    return this.story && this.story.changed('releasedAt', false);
  }

  toggleShowReleaseAt() {
    this.showReleasedAt = !this.showReleasedAt;
    if (this.story.releasedAt) {
      this.story.releasedAt = null;
      this.notifyOfCanceledPublication();
    } else {
      this.story.releasedAt = new Date();
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
