import { Component, Input, OnInit } from '@angular/core';
import { StoryModel, SeriesModel } from '../shared';
import { Env } from '../core/core.env';

@Component({
  selector: 'publish-dashboard-story',
  styleUrls: ['dashboard-story.component.css'],
  template: `
    <div *ngIf="status" class="{{status}} status bar"></div>
    <p class="story-date">{{(story?.publishedAt || story?.releasedAt) | date:"M/d"}}</p>
    <div class="title">
      <h2>
        <a *ngIf="story?.title" [routerLink]="editLink">{{story?.title}}</a>
        <a *ngIf="!story?.title" [routerLink]="editLink">{{(story?.publishedAt || story?.releasedAt) | date:"MMM d, y"}}</a>
      </h2>
      <h3>
        <span class="teaser">{{story?.shortDescription}}</span>
        <span *ngIf="status" class="{{status}} status text">{{status}}</span>
      </h3>
    </div>
    <div class="actions">
      <prx-spinner *ngIf="episodeLoader || podcastLoader" inverse="true"></prx-spinner>
      <a *ngIf="metricsUrl" [href]="metricsUrl" rel="noopener noreferrer" target="_blank">
        <span class="icon-bar-chart"></span>
      </a>
      <a [routerLink]="editLink"><span class="icon-pencil"></span></a>
    </div>
  `
})

export class DashboardStoryComponent implements OnInit {

  @Input() series: SeriesModel;
  @Input() story: StoryModel;
  @Input() episodeLoader: boolean;
  @Input() podcastLoader: boolean;

  editLink: any[];

  storyDate: Date;

  status: string;
  metricsUrlParams: string;

  ngOnInit() {
    this.setLink();
    this.setStatus();
    this.setMetricsUrlParams();
  }

  setLink() {
    if (this.story.isNew) {
      this.editLink = ['/story/new'];
      if (this.story.parent) {
        this.editLink.push(this.story.parent.id);
      }
    } else {
      this.editLink = ['/story', this.story.id];
    }
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

  setMetricsUrlParams() {
    if (this.story.publishedAt) {
      const today = new Date();
      const endDate = new Date(Date.UTC(today.getUTCFullYear(),
                                        today.getUTCMonth(),
                                        today.getUTCDate(), 23, 59, 59)).toUTCString();
      const beginDate = new Date(Date.UTC(this.story.publishedAt.getUTCFullYear(),
                                          this.story.publishedAt.getUTCMonth(),
                                          this.story.publishedAt.getUTCDate(), 0, 0, 0)).toUTCString();
      this.metricsUrlParams =  `;beginDate=${encodeURIComponent(beginDate)};endDate=${encodeURIComponent(endDate)}`
    }
  }

  get metricsUrl(): string {
    if (this.status === 'published' && this.story && this.story.distributions
        && this.series && this.series.distributions) {
      const seriesDistribution = this.series.distributions.find(d => d.kind === 'podcast')
      const storyDistribution = this.story.distributions.find(d => d.kind === 'episode');
      const podcastId = seriesDistribution && seriesDistribution.feederPodcastId;
      const episodeGuid = storyDistribution && encodeURIComponent(storyDistribution.feederEpisodeId);
      if (podcastId && episodeGuid) {
        return `${Env.METRICS_HOST}/${podcastId}/reach/episodes/daily;episodePage=1;guids=${episodeGuid}${this.metricsUrlParams}`;
      }
    }
  }
}
