
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { HalDoc } from '../../core';
import { StoryModel, SeriesModel } from '../../shared';

@Component({
  selector: 'publish-calendar-series',
  styleUrls: ['production-calendar-series.component.css'],
  template: `
    <header>
      <div>
        <select (change)="filterByMonth($event.target.value)">
          <option selected disabled value="undefined">Filter by month</option>
          <option *ngFor="let month of months" [value]="month" [selected]="month === monthFilter">
            {{month | date:"MMMM y"}}
          </option>
        </select>

        <select (change)="filterByPublishState($event.target.value)">
          <option selected disabled value="undefined">Filter by publish state</option>
          <option *ngFor="let state of publishStates" [value]="state" [selected]="state === publishStateFilter">
            {{state | capitalize}}
          </option>
        </select>
      </div>

      <div>
        <a class="button" [routerLink]="['/series', series.id]">CSV Export</a>
      </div>
    </header>

    <section>
      <div *ngFor="let month of storyMonths">
        <h2>{{month | date:"MMMM y"}}</h2>
        <publish-calendar-story *ngFor="let s of stories[month]; let i = index"
          [series]="series" [story]="s" [episodeLoader]="episodeLoaders && episodeLoaders[i]" [podcastLoader]="podcastLoader">
        </publish-calendar-story>
      </div>
      <div *ngFor="let l of storyLoaders" class="story-loader"><prx-spinner></prx-spinner></div>
    </section>
  `
})

export class ProductionCalendarSeriesComponent implements OnInit {

  PER_SERIES = 10;

  @Input() series: SeriesModel;

  count = -1;
  id: number;
  title: string;
  stories: {[yearMonth: string]: StoryModel[]};
  storyMonths: string[];
  storyLoaders: boolean[];
  episodeLoaders: boolean[];
  podcastLoader: boolean;
  publishStates = ['draft', 'scheduled', 'published'];
  publishStateFilter: string;
  monthFilter: string;
  lastStoryDate: Date;

  ngOnInit() {
    this.loadSeriesStories();
    this.loadLastDatedStory();
  }

  loadSeriesStories() {
    this.id = this.series.id;
    this.title = this.series.title;
    this.count = this.series.doc.count('prx:stories');

    // how many stories to display?
    const per = Math.min(this.count, this.PER_SERIES);
    this.storyLoaders = Array(per);
    this.episodeLoaders = Array(per).fill(true);

    let filters: string;
    if (this.monthFilter) {
      const after = new Date(this.monthFilter);
      let before = new Date(after.valueOf());
      before.setMonth(before.getMonth() + 1);
      const afterStr = `${after.getFullYear()}-${after.getMonth() + 1}-${after.getDate()}`;
      const beforeStr = `${before.getFullYear()}-${before.getMonth() + 1}-${before.getDate()}`;
      filters = `v4,after=${afterStr},before=${beforeStr}`
    } else {
      const afterToday = new Date();
      filters = `v4,after=${afterToday.getFullYear()}-${afterToday.getMonth() + 1}-${afterToday.getDate()}`;
    }
    if (this.publishStateFilter) {
      filters = filters += `,state=${this.publishStateFilter}`;
    }

    this.series.doc.followItems('prx:stories', {
      per,
      filters,
      sorts: 'published_released_at: asc'
    }).pipe(
      map((stories: HalDoc[]) => {
        this.stories = stories.map(story => new StoryModel(this.series.doc, story, false)).reduce((acc, story) => {
          const storyDate = story.publishedAt || story.releasedAt;
          const monthKey = `${storyDate.getFullYear()}-${storyDate.getMonth() + 1}-1`;
          acc[monthKey] = acc[monthKey] ?  [...acc[monthKey], story] : [story];
          return acc;
        }, {});

        this.storyLoaders = null;

        this.storyMonths = Object.keys(this.stories);

        return Object.keys(this.stories).map(key => {
          return this.stories[key].map((story: StoryModel, i) => {
            return story.loadRelated('versions');
          });
        })
      })
    ).subscribe(() => this.episodeLoaders.fill(false));
  }

  loadLastDatedStory() {
    const afterToday = new Date();
    const filters = `v4,after=${afterToday.getFullYear()}-${afterToday.getMonth() + 1}-${afterToday.getDate()}`;
    this.series.doc.followItems('prx:stories', {
      per: 1,
      filters,
      sorts: 'published_released_at: desc'
    }).subscribe((stories: HalDoc[]) => {
      this.lastStoryDate = stories.length && new Date((stories[0]['publishedAt'] || stories[0]['releasedAt']));
    });
  }

  filterByPublishState(state: string) {
    this.storyMonths = null;
    this.publishStateFilter = state;
    this.loadSeriesStories();
  }

  get months(): Date[] {
    if (this.storyMonths && this.storyMonths.length && this.lastStoryDate) {
      let months = [];
      let date = new Date(this.storyMonths[0]);
      while (date.valueOf() < this.lastStoryDate.valueOf()) {
        months.push(new Date(date.valueOf()));
        date.setMonth(date.getMonth() + 1);
      }
      return months;
    }
  }

  filterByMonth(month: string) {
    this.storyMonths = null;
    this.monthFilter = month;
    this.loadSeriesStories();
  }
}
