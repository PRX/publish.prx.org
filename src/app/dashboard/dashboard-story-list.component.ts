import { Component, Input, OnInit } from '@angular/core';
import { mergeMap, map } from 'rxjs/operators';
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
    <publish-dashboard-story *ngFor="let s of stories; let i = index"
      [story]="s" [series]="series" [episodeLoader]="episodeLoaders && episodeLoaders[i]" [podcastLoader]="podcastLoader">
    </publish-dashboard-story>
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
  @Input() podcastLoader: boolean;
  @Input() heading: string;
  @Input() showCalendar: boolean;
  PER_SERIES = 10;
  stories: StoryModel[];
  storyLoaders: boolean[];
  // won't need these distributions with new layout
  episodeLoaders: boolean[];

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
    this.episodeLoaders = Array(per).fill(true);
    const filters = this.showCalendar ?
      `v4,state=${publishStateFilter},after=${new Date().toISOString()}` :
      `v4,state=${publishStateFilter}`;
    const sorts = this.showCalendar ? 'published_released_at: asc' : 'published_at: desc';

    this.series.doc.followItems('prx:stories', {
      per,
      filters,
      sorts,
      zoom: 'prx:distributions'
    }).pipe(
      map((stories: HalDoc[]) => {
        this.stories = stories.map(story => new StoryModel(this.series.doc, story, false));
        this.storyLoaders = null;
        return this.stories;
      }),
      mergeMap((stories: StoryModel[]) => {
        return stories.map(story => story.loadRelated('distributions'))
      })
    ).subscribe(() => {
      this.episodeLoaders.fill(false);
    });
  }

  loadStandaloneStories(publishStateFilter?) {
    const per = this.PER_SERIES;
    this.storyLoaders = Array(1); // just one

    this.auth.followItems('prx:stories', {
      filters: `noseries,v4,state=${publishStateFilter}`,
      per,
      sorts: 'published_released_at: desc',
      zoom: 'prx:distributions'
    }).subscribe((stories: HalDoc[]) => {
      this.stories = stories.map(story => new StoryModel(this.account, story, false));
      this.storyLoaders = null;
    });
  }
}
