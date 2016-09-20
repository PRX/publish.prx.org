import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { HalDoc, StoryModel } from '../../shared';

@Component({
  selector: 'publish-home-series',
  styleUrls: ['home-series.component.css'],
  template: `
    <header *ngIf="noseries">
      <h2>Your Standalone Stories</h2>
      <a *ngIf="count > -1" class="all" href="#">View All {{count}} &raquo;</a>
    </header>
    <header *ngIf="!noseries">
      <a href="#">
        <image-loader [imageDoc]="logoDoc"></image-loader>
      </a>
      <p class="count">{{count}} Stories</p>
      <h1><a href="/series/{{id}}">{{title}}</a></h1>
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
      this.stories = [new StoryModel(this.series)];
      for (let story of stories) {
        this.stories.push(new StoryModel(this.series, story, false));
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

      this.stories = [new StoryModel(accountDoc)];
      for (let story of storyDocs) {
        this.stories.push(new StoryModel(accountDoc, story, false));
      }
      this.storyLoaders = null;
    });
  }

}
