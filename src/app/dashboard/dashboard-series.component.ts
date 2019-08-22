
import { Component, Input, OnInit } from '@angular/core';
import { HalDoc } from '../core';
import { SeriesModel } from '../shared';

@Component({
  selector: 'publish-dashboard-series',
  styleUrls: ['dashboard-series.component.css'],
  template: `
    <div *ngIf="noseries" class="noseries">
      <header>
        <h2>Your Standalone Episodes</h2>
        <a *ngIf="totalNumberEpisodes > -1" class="all"
          [routerLink]="['/search', { tab: 'stories', seriesId: -1 }]">
          View All {{totalNumberEpisodes}} &raquo;
        </a>
      </header>
      <div class="series-actions">
        <a class="button" [routerLink]="['/story/new']">Create an Episode</a>
      </div>
    </div>
    <header *ngIf="!noseries">
      <div class="title">
        <a [routerLink]="['/series', id]">
          <prx-image [imageDoc]="series?.doc"></prx-image>
        </a>
        <p class="count">
          <span *ngIf="totalNumberEpisodes === 0">0 Episodes</span>
          <a *ngIf="totalNumberEpisodes > 0" [routerLink]="['/search', { tab: 'stories', seriesId: id }]">
            {{totalNumberEpisodes | i18nPlural: {'=1' : '1 Episode', 'other' : '# Episodes'} }}
          </a>
        </p>
        <h1><a [routerLink]="['/series', id]">{{title}}</a></h1>
        <p class="updated">Last updated {{updated | timeago}}</p>
      </div>
      <div class="series-actions">
        <a class="button" [routerLink]="['/story/new', id]">Create an Episode</a>
        <a class="button" [routerLink]="['/series', id, 'plan']">Plan Episodes</a>
      </div>
    </header>
    <div class="story-lists">
      <publish-dashboard-story-list
        [auth]="auth"
        [account]="account"
        [noseries]="noseries"
        [series]="series"
        publishState="unpublished"
        isDraftList="true">
      </publish-dashboard-story-list>
      <publish-dashboard-story-list
        [auth]="auth"
        [account]="account"
        [noseries]="noseries"
        [series]="series"
        publishState="published">
      </publish-dashboard-story-list>
    </div>
  `
})
export class DashboardSeriesComponent implements OnInit {

  @Input() series: SeriesModel;
  @Input() account: HalDoc;
  @Input() auth: HalDoc;
  @Input() noseries: boolean;

  totalNumberEpisodes = -1;
  id: number;
  title: string;
  updated: Date;
  publishStates = ['draft', 'scheduled', 'published'];
  publishStateOptions = this.publishStates.map(s => s.length && [s.charAt(0).toUpperCase() + s.slice(1), s]);
  publishStateFilter: string;

  ngOnInit() {
    if (this.noseries) {
      this.standaloneStories();
    } else {
      this.seriesStories();
    }
  }

  seriesStories() {
    this.id = this.series.id;
    this.title = this.series['title'];
    this.totalNumberEpisodes = this.series.doc.count('prx:stories');
    this.updated = new Date(this.series['updatedAt']);
  }

  standaloneStories() {
    this.auth.followItems('prx:stories', {
      filters: 'noseries,v4'
    }).subscribe((stories: HalDoc[]) => {
      // parent result total is embedded in child total
      this.totalNumberEpisodes = stories.length ? stories[0].total() : 0;
    });
  }

}
