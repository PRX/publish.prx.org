
import { concat as observableConcat } from 'rxjs';

import { map, mergeMap, toArray } from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';

import { HalDoc } from '../core';
import { StoryModel, SeriesModel } from '../shared';

@Component({
  selector: 'publish-dashboard-series',
  styleUrls: ['dashboard-series.component.css'],
  template: `
    <div *ngIf="noseries" class="noseries">
      <header>
        <h2>Your Standalone Episodes</h2>
        <a *ngIf="count > -1" class="all" [routerLink]="['/search', { tab: 'stories', seriesId: -1 }]">View All {{count}} &raquo;</a>
      </header>
      <div class="series-actions">
        <a class="button" [routerLink]="['/story/new']">Create an Episode</a>
      </div>
    </div>
    <header *ngIf="!noseries">
      <div class="title">
        <a [routerLink]="['/series', id]">
          <prx-image [imageDoc]="series"></prx-image>
        </a>
        <p class="count">
          <span *ngIf="count === 0">0 Episodes</span>
          <a *ngIf="count > 0" [routerLink]="['/search', { tab: 'stories', seriesId: id }]">
            {{count | i18nPlural: {'=1' : '1 Episode', 'other' : '# Episodes'} }}
          </a>
        </p>
        <h1><a [routerLink]="['/series', id]">{{title}}</a></h1>
        <p class="updated">Last updated {{updated | timeago}}</p>
      </div>
      <div class="series-actions">
        <a class="button" [routerLink]="['/story/new', id]">Create an Episode</a>
      </div>
    </header>
    <div class="list-actions">
      <div>
        <button class="btn-link" [disabled]="isListView">Episode List</button> |
        <button class="btn-link" [disabled]="!isListView">Calendar</button>
      </div>
      <div>
        <select (change)="filterByPublishState($event.target.value)">
          <option selected disabled value="undefined">Filter by publish state</option>
          <option *ngFor="let state of publishStates" [value]="state" [selected]="state === publishStateFilter">
            {{state | capitalize}}
          </option>
        </select>
      </div>
    </div>
    <div class="story-list">
      <publish-dashboard-story *ngFor="let s of stories; let i = index"
        [story]="s" [series]="seriesModel" [episodeLoader]="episodeLoaders && episodeLoaders[i]" [podcastLoader]="podcastLoader">
      </publish-dashboard-story>
      <div *ngFor="let l of storyLoaders" class="story-loader"><prx-spinner></prx-spinner></div>
    </div>
  `
})

export class DashboardSeriesComponent implements OnInit {

  PER_SERIES = 10;

  @Input() series: HalDoc;
  @Input() auth: HalDoc;
  @Input() noseries: boolean;

  count = -1;
  id: number;
  title: string;
  updated: Date;
  seriesModel: SeriesModel;
  stories: StoryModel[];
  storyLoaders: boolean[];
  episodeLoaders: boolean[];
  podcastLoader: boolean;
  isListView = true;
  publishStates = ['draft', 'scheduled', 'published'];
  publishStateFilter: string;

  ngOnInit() {
    if (this.noseries) {
      this.loadStandaloneStories();
    } else {
      this.loadSeriesStories();
      this.loadSeriesDistribution();
    }
  }

  loadSeriesStories() {
    this.id = this.series.id;
    this.title = this.series['title'];
    this.count = this.series.count('prx:stories');
    this.updated = new Date(this.series['updatedAt']);

    // how many stories to display?
    const total = this.series.count('prx:stories');
    const max = this.PER_SERIES;
    const per = Math.min(total, max);
    this.storyLoaders = Array(per);
    this.episodeLoaders = Array(per).fill(true);

    this.series.followItems('prx:stories', {
      per,
      filters: this.publishStateFilter ? `v4,state=${this.publishStateFilter}` : 'v4',
      sorts: 'published_released_at: desc',
      zoom: 'prx:image'
    }).subscribe((stories: HalDoc[]) => {
      this.stories = stories.map(story => new StoryModel(this.series, story, false));
      this.storyLoaders = null;
      this.stories
        .forEach((story: StoryModel, i) => {
          if (story.publishedAt && story.publishedAt.valueOf() <= Date.now()) {
            story.loadRelated('distributions').subscribe(() => {
              const episodeDistribution = story.distributions.find(d => d.kind === 'episode');
              if (episodeDistribution) {
                episodeDistribution.loadRelated('episode').subscribe(() => {
                  this.episodeLoaders[i] = false;
                })
              } else {
                this.episodeLoaders[i] = false;
              }
            });
          } else {
            this.episodeLoaders[i] = false;
          }
        });
    });
  }

  loadSeriesDistribution() {
    this.auth.follow('prx:default-account').subscribe((account: HalDoc) => {
      this.podcastLoader = true;
      this.seriesModel = new SeriesModel(account, this.series);
      this.seriesModel.loadRelated('distributions').subscribe(() => {
        const podcastDistribution = this.seriesModel.distributions.find(d => d.kind === 'podcast');
        if (podcastDistribution) {
          podcastDistribution.loadRelated('podcast').subscribe(() => {
            this.podcastLoader = false;
          });
        } else {
          this.podcastLoader = false;
        }
      })
    });
  }

  loadStandaloneStories() {
    const per = this.PER_SERIES;
    this.storyLoaders = Array(1); // just one

    let account = this.auth.follow('prx:default-account');
    let stories = this.auth.followItems('prx:stories', {
      filters: this.publishStateFilter ? `noseries,v4,state=${this.publishStateFilter}` : 'noseries,v4',
      per,
      sorts: 'published_released_at: desc'
    });

    observableConcat(account, stories).pipe(toArray()).subscribe((results) => {
      let accountDoc = <HalDoc> results[0];
      let storyDocs = <HalDoc[]> results[1];

      // parent result total is embedded in child total
      this.count = storyDocs.length ? storyDocs[0].total() : 0;

      this.stories = storyDocs.map(story => new StoryModel(accountDoc, story, false));
      this.storyLoaders = null;
    });
  }

  filterByPublishState(state: string) {
    this.stories = null;
    this.publishStateFilter = state;
    if (this.noseries) {
      this.loadStandaloneStories();
    } else {
      this.loadSeriesStories();
    }
  }

}
