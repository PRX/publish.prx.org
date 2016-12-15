import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-home-series',
  styleUrls: ['home-series.component.css'],
  template: `
    <header *ngIf="noseries">
      <section [publishHoverTip]="'These are your Stories not associated with any existing Series.'">
        <p></p>
      </section>
      <h2>Your Standalone Stories</h2>
      <a *ngIf="count > -1" class="all" [routerLink]="['search', { tab: 'stories', seriesId: -1 }]">View All {{count}} &raquo;</a>
    </header>
    <header *ngIf="!noseries">
      <a href="#">
        <publish-image [imageDoc]="logoDoc"></publish-image>
      </a>
      <p class="count">
        <span *ngIf="count === 0">0 Stories</span>
        <span *ngIf="count > 9">Showing 9 of </span>
        <a *ngIf="count > 0" [routerLink]="['search', { tab: 'stories', seriesId: id }]">{{count}} Stories</a>
      </p>
      <h1><a [routerLink]="['series', id]">{{title}}</a></h1>
      <p class="updated">Last updated {{updated | timeago}}</p>
    </header>
    <div class="story-list">
      <publish-home-story *ngFor="let s of stories" [story]="s"></publish-home-story>
      <div *ngFor="let l of storyLoaders" class="story"><publish-spinner></publish-spinner></div>
    </div>
  `
})

export class HomeSeriesComponent implements OnInit {

  PER_ROW = 5;

  @Input() series: HalDoc;
  @Input() auth: HalDoc;
  @Input() noseries: boolean;
  @Input() rows: number = 1;

  logoDoc: HalDoc;
  count: number = -1;
  id: number;
  title: string;
  updated: Date;
  stories: StoryModel[];
  storyLoaders: boolean[];

  ngOnInit() {
    if (this.noseries) {
      this.loadStandaloneStories();
    } else {
      this.loadSeriesStories();
    }
  }

  loadSeriesStories() {
    this.id = this.series.id;
    this.title = this.series['title'];
    this.count = this.series.count('prx:stories');
    this.updated = new Date(this.series['updatedAt']);
    this.logoDoc = this.series;

    // how many stories to display? (plus 1 new/draft story)
    let total = this.series.count('prx:stories');
    let max = (this.rows * this.PER_ROW) - 1; // placeholder
    let limit = Math.min(total, max);
    this.storyLoaders = Array(limit + 1);

    this.series.followItems('prx:stories', {per: limit, filters: 'v4'}).subscribe((stories) => {
      this.storyLoaders = null;
      this.stories = [new StoryModel(this.series, null, true)];
      for (let story of stories) {
        this.stories.push(new StoryModel(this.series, story, true));
      }
    });
  }

  loadStandaloneStories() {
    let limit = (this.rows * this.PER_ROW) - 1;
    this.storyLoaders = Array(1); // just one

    let account = this.auth.follow('prx:default-account');
    let stories = this.auth.followItems('prx:stories', {filters: 'noseries,v4', per: limit});

    Observable.concat(account, stories).toArray().subscribe((results) => {
      let accountDoc = <HalDoc> results[0];
      let storyDocs = <HalDoc[]> results[1];

      // parent result total is embedded in child total
      this.count = storyDocs.length ? storyDocs[0].total() : 0;

      this.stories = [new StoryModel(accountDoc, null, true)];
      for (let story of storyDocs) {
        this.stories.push(new StoryModel(accountDoc, story, true));
      }
      this.storyLoaders = null;
    });
  }

}
