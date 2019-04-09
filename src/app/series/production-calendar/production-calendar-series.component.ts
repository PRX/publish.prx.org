
import { Component, Input, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { map, toArray } from 'rxjs/operators';
import { concat, of } from 'rxjs';
import { HalDoc } from '../../core';
import { StoryModel, SeriesModel } from '../../shared';

@Component({
  selector: 'publish-calendar-series',
  styleUrls: ['production-calendar-series.component.css'],
  template: `
    <header *ngIf="stories">
      <prx-select
        placeholder="Filter by month"
        [options]="allMonthOptions"
        [selected]="monthFilter"
        single="true"
        closeOnSelect="true"
        (onSelect)="filterByMonth($event)">
      </prx-select>

      <prx-select
        placeholder="Filter by publish state"
        [options]="publishStateOptions"
        [selected]="publishStateFilter"
        single="true"
        closeOnSelect="true"
        (onSelect)="filterByPublishState($event)">
      </prx-select>
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
  publishStateOptions = this.publishStates.map(s => s.length && [s.charAt(0).toUpperCase() + s.slice(1), s]);;
  publishStateFilter: string;
  allMonthOptions: any[][];
  monthFilter: string;
  firstStoryDate: Date;
  lastStoryDate: Date;

  ngOnInit() {
    this.loadSeriesStories();
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
      const afterStr = `${after.getFullYear()}-${after.getMonth() + 1}-1`;
      const beforeStr = `${before.getFullYear()}-${before.getMonth() + 1}-1`;
      filters = `v4,after=${afterStr},before=${beforeStr}`
    } else {
      const afterToday = new Date();
      filters = `v4,after=${afterToday.getFullYear()}-${afterToday.getMonth() + 1}-${afterToday.getDate()}`;
    }
    if (this.publishStateFilter) {
      filters = filters += `,state=${this.publishStateFilter}`;
    }

    concat(
      this.firstStoryDate ? of([{publishedAt: this.firstStoryDate}]) : this.loadTopStory('asc'),
      this.lastStoryDate ? of([{publishedAt: this.lastStoryDate}]) : this.loadTopStory('desc'),
      this.series.doc.followItems('prx:stories', {
        per,
        filters,
        sorts: 'published_released_at: asc'
      })
    ).pipe(
      toArray(),
      map((results: HalDoc[][]) => {
        const firstStory = results[0]; // ordered by published_released_at asc
        this.firstStoryDate = firstStory.length && new Date((firstStory[0]['publishedAt'] || firstStory[0]['releasedAt']));
        const lastStory = results[1]; // ordered by published_released_at desc
        this.lastStoryDate = lastStory.length && new Date((lastStory[0]['publishedAt'] || lastStory[0]['releasedAt']));
        return results[2]; // paged stories
      }),
      map((stories: HalDoc[]) => {
        this.setStoryMonths(stories.map(story => new StoryModel(this.series.doc, story, false)));

        return this.storyMonths.map(key => {
          return this.stories[key].map((story: StoryModel) => {
            return story.loadRelated('versions');
          });
        })
      })
    ).subscribe(() => this.episodeLoaders.fill(false));
  }

  setStoryMonths(stories: StoryModel[]) {
    this.stories = stories.reduce((acc, story) => {
      const storyDate = story.publishedAt || story.releasedAt;
      const monthKey = `${storyDate.getFullYear()}-${storyDate.getMonth() + 1}-1`;
      acc[monthKey] = acc[monthKey] ?  [...acc[monthKey], story] : [story];
      return acc;
    }, {});

    this.storyMonths = Object.keys(this.stories);
    this.setAllMonthOptions();
    this.storyLoaders = null;
  }

  loadTopStory(order: 'asc' | 'desc') {
    const afterToday = new Date();
    const filters = `v4,after=${afterToday.getFullYear()}-${afterToday.getMonth() + 1}-${afterToday.getDate()}`;
    return this.series.doc.followItems('prx:stories', {
      per: 1,
      filters,
      sorts: `published_released_at: ${order}`
    });
  }

  filterByPublishState(state: string) {
    this.storyMonths = null;
    this.publishStateFilter = state;
    this.loadSeriesStories();
  }

  setAllMonthOptions() {
    if (this.firstStoryDate && this.lastStoryDate) {
      let months = [];
      let date = new Date(this.firstStoryDate);
      while (date.valueOf() < this.lastStoryDate.valueOf()) {
        months.push(new Date(date.valueOf()));
        date.setMonth(date.getMonth() + 1);
      }
      this.allMonthOptions = months.map(m => [formatDate(m, 'MMMM y', 'en-US'), m.toLocaleString()]);
    }
  }

  filterByMonth(month: string) {
    this.storyMonths = null;
    this.monthFilter = month;
    this.loadSeriesStories();
  }
}
