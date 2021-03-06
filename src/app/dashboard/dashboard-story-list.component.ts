import { Component, Input, OnInit } from '@angular/core';
import { HalDoc } from 'ngx-prx-styleguide';
import { StoryModel, SeriesModel } from '../shared';

@Component({
  selector: 'publish-dashboard-story-list',
  template: `
    <h2>
      <span class="list-heading">
        {{ isUnpublishedList ? 'Draft and Scheduled Episodes' : 'Published Episodes'}} <span *ngIf="storyLoaders">Loading...</span>
      </span>
      <span *ngIf="isUnpublishedList && series"> |
        <a [routerLink]="['/series', series.id, 'calendar']">Calendar view</a>
      </span>
    </h2>

    <ng-container *ngIf="!storyLoaders && !storyLoaders?.length">
      <prx-episode-card
        *ngFor="let s of stories"
        [editLink]="['/story', s.id]"
        [date]="s.publishedAt || s.releasedAt"
        dateFormat="M/d"
        [title]="s.title"
        [teaser]="s.shortDescription"
        [status]="storyStatus(s)">
      </prx-episode-card>
    </ng-container>
    <div *ngFor="let l of storyLoaders" class="story-loader"><prx-spinner></prx-spinner></div>

    <p class="call-to-action" *ngIf="isUnpublishedList && series && totalEpisodesInList < 3">
      The more drafts you add, the better we can support your podcast.
      Please add
      <a [routerLink]="['/series', series.id, 'plan']">
        all of your known upcoming episodes
      </a>
      to the Production Calendar.
    </p>
    <p class="call-to-action" *ngIf="!isUnpublishedList && series && totalEpisodesInList === 0">
      You haven't published any episodes on your podcast yet.
    </p>

    <prx-paging
      *ngIf="totalPages > 1"
      [currentPage]="page"
      [totalPages]="totalPages"
      (showPage)="this.loadStoryPage($event)">
    </prx-paging>
  `,
  styleUrls: ['dashboard-story-list.component.css']
})

export class DashboardStoryListComponent implements OnInit {
  @Input() auth: HalDoc;
  @Input() account: HalDoc;
  @Input() noseries: boolean;
  @Input() series: SeriesModel;
  @Input() isUnpublishedList = false;
  PER_SERIES = 10;
  stories: StoryModel[];
  storyLoaders: boolean[];
  page: number;
  totalEpisodesInList: number;
  totalPages: number;

  ngOnInit() {
    this.loadStoryPage(1);
  }

  loadStoryPage(page: number) {
    this.page = page;
    if (this.noseries) {
      this.loadStandaloneStories(page);
    } else {
      this.loadSeriesStories(page);
    }
  }

  loadSeriesStories(page: number) {
    // totalNumberEpisodes won't be accurate because it is all episodes, filters not applied
    // but it really only affects how many spinners to display for estimated results
    const totalNumberEpisodes = this.series.doc.count('prx:stories');
    const max = this.PER_SERIES;
    const per = Math.min(totalNumberEpisodes, max);
    this.storyLoaders = Array(per);

    const filters = this.storyFilter();
    const sorts = this.storySort();

    this.series.doc.followItems('prx:stories', {page, per, filters, sorts, zoom: false}).subscribe((stories: HalDoc[]) => {
      this.stories = stories.map(story => new StoryModel(this.series.doc, story, false));
      this.storyLoaders = null;
      this.setTotalPages(stories.length ? stories[0].total() : 0);
    });
  }

  loadStandaloneStories(page: number) {
    const per = this.PER_SERIES;
    this.storyLoaders = Array(1); // just one
    const filters = 'noseries,' + this.storyFilter();
    const sorts = this.storySort();
    this.page = page;

    this.auth.followItems('prx:stories', {page, per, filters, sorts, zoom: false}).subscribe((stories: HalDoc[]) => {
      this.stories = stories.map(story => new StoryModel(this.account, story, false));
      this.storyLoaders = null;
      if (stories.length) {
        this.setTotalPages(stories[0].total());
      }
    });
  }

  storyFilter(): string {
    if (this.isUnpublishedList) {
      return `v4,state=unpublished`
    } else {
      return 'v4,state=published';
    }
  }

  storySort(): string {
    return this.isUnpublishedList ? 'released_at: asc' : 'published_at: desc';
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

  setTotalPages(totalInList: number) {
    this.totalEpisodesInList = totalInList;
    this.totalPages = Math.floor(totalInList / this.PER_SERIES);
    if (totalInList % this.PER_SERIES) {
      this.totalPages++;
    }
  }
}
