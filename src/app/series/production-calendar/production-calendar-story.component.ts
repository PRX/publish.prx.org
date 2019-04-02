import { Component, Input, OnInit } from '@angular/core';
import { StoryModel, SeriesModel } from '../../shared';
import { Env } from '../../core/core.env';

@Component({
  selector: 'publish-calendar-story',
  styleUrls: ['production-calendar-story.component.css'],
  template: `
    <div *ngIf="status" class="{{status}} status bar"></div>
    <p class="story-date">{{(story.publishedAt || story.releasedAt) | date:"d"}}</p>
    <div class="title">
      <h2>
        <a *ngIf="story?.title" [routerLink]="['/story', this.story.id]">{{story.title}}</a>
        <a *ngIf="!story?.title" [routerLink]="['/story', this.story.id]">{{(story.publishedAt || story.releasedAt) | date:"MMM d, y"}}</a>
      </h2>
      <h3>
        <span class="teaser" *ngIf="story?.shortDescription">{{story?.shortDescription}}</span>
        <span *ngIf="status" class="{{status}} status text">{{status}}</span>
      </h3>
    </div>
    <div class="segments">
      <prx-spinner *ngIf="episodeLoader || podcastLoader" inverse="true"></prx-spinner>
      <span *ngIf="segments">{{segments | i18nPlural: {'=1' : '1 Segment', 'other' : '# Segments'} }}</span>
    </div>
  `
})

export class ProductionCalendarStoryComponent implements OnInit {

  @Input() series: SeriesModel;
  @Input() story: StoryModel;
  @Input() episodeLoader: boolean;
  @Input() podcastLoader: boolean;

  editLink: any[];

  status: string;
  metricsUrlParams: string;

  ngOnInit() {
    this.setStatus();
  }

  setStatus() {
    if (this.story.isNew) {
      this.status = 'new';
    } else if (!this.story.publishedAt) {
      this.status = 'draft';
    } else if (!this.story.isPublished()) {
      this.status = 'scheduled';
    } else {
      this.status = 'published';
    }
  }

  get segments(): number {
    return this.story && this.story.versions && this.story.versions.length &&
      this.story.versions[0].files && this.story.versions[0].files.length;
  }
}
