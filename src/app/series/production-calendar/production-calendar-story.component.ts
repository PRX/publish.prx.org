import { Component, Input, OnInit } from '@angular/core';
import { StoryModel, SeriesModel } from '../../shared';

@Component({
  selector: 'publish-calendar-story',
  styleUrls: ['production-calendar-story.component.css'],
  template: `
    <prx-episode-card
      [editLink]="['/story', story.id]"
      [date]="story.publishedAt || story.releasedAt"
      dateFormat="d"
      [title]="story.title"
      [teaser]="story.shortDescription"
      [status]="status">
      <div class="actions">
        <prx-spinner *ngIf="episodeLoader || podcastLoader" inverse="true"></prx-spinner>
        <span *ngIf="template">{{ template }}</span>
      </div>
    </prx-episode-card>
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

  get template(): string {
    return this.story && this.story.versions && this.story.versions.length && this.story.versions[0].label;
  }
}
