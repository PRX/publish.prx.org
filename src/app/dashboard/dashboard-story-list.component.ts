import { Component, Input, OnInit } from '@angular/core';
import { HalDoc } from 'ngx-prx-styleguide';
import { StoryModel, SeriesModel } from '../shared';

@Component({
  selector: 'publish-dashboard-story-list',
  template: `
    <h2 *ngIf="series && (stories?.length || storyLoaders)">
      <span class="list-heading">{{heading}} <span *ngIf="storyLoaders">Loading...</span></span>
      <span *ngIf="showCalendar"> |
        <a [routerLink]="['/series', series.id, 'calendar']">Calendar view</a>
      </span>
    </h2>
    <prx-episode-card
      *ngFor="let s of stories"
      [editLink]="['/story', s.id]"
      [date]="s.publishedAt || s.releasedAt"
      dateFormat="M/d"
      [title]="s.title"
      [teaser]="s.shortDescription"
      [status]="storyStatus(s)">
    </prx-episode-card>
    <div *ngFor="let l of storyLoaders" class="story-loader"><prx-spinner></prx-spinner></div>
  `,
  styleUrls: ['dashboard-story-list.component.css']
})

export class DashboardStoryListComponent implements OnInit {
  @Input() auth: HalDoc;
  @Input() account: HalDoc;
  @Input() noseries: boolean;
  @Input() series: SeriesModel;
  @Input() publishState: string;
  @Input() heading: string;
  @Input() showCalendar: boolean;
  PER_SERIES = 10;
  stories: StoryModel[];
  storyLoaders: boolean[];

  ngOnInit() {
    if (this.noseries) {
      this.loadStandaloneStories(this.publishState);
    } else {
      this.loadSeriesStories(this.publishState);
    }
  }

  loadSeriesStories(publishStateFilter: string) {
    // how many stories to display?
    const total = this.series.doc.count('prx:stories');
    const max = this.PER_SERIES;
    const per = Math.min(total, max);
    this.storyLoaders = Array(per);
    const filters = this.storyFilter(publishStateFilter, this.showCalendar);
    const sorts = this.storySort(this.showCalendar);

    this.series.doc.followItems('prx:stories', {per, filters, sorts, zoom: false}).subscribe((stories: HalDoc[]) => {
      this.stories = stories.map(story => new StoryModel(this.series.doc, story, false));
      this.storyLoaders = null;
    });
  }

  loadStandaloneStories(publishStateFilter: string) {
    const per = this.PER_SERIES;
    this.storyLoaders = Array(1); // just one
    const filters = 'noseries,' + this.storyFilter(publishStateFilter, this.showCalendar);
    const sorts = this.storySort(this.showCalendar);

    this.auth.followItems('prx:stories', {per, filters, sorts, zoom: false}).subscribe((stories: HalDoc[]) => {
      this.stories = stories.map(story => new StoryModel(this.account, story, false));
      this.storyLoaders = null;
    });
  }

  storyFilter(publishStateFilter: string, afterToday: boolean): string {
    return afterToday ?
    `v4,state=${publishStateFilter},after=${new Date().toISOString()}` :
    `v4,state=${publishStateFilter}`;
  }

  storySort(asc: boolean): string {
    return asc ? 'published_released_at: asc' : 'published_at: desc';
  }

  storyStatus(story: StoryModel): string {
    if (story.isNew) {
      return 'new';
    } else if (!story.publishedAt) {
      return 'draft';
    } else if (!story.isPublished()) {
      return 'scheduled';
    } else {
      return 'published';
    }
  }
}
