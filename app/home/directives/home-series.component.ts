import {Component, Input, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {HalDoc} from '../../shared/cms/haldoc';
import {SpinnerComponent} from '../../shared/spinner/spinner.component';
import {ImageLoaderComponent} from '../../shared/image/image-loader.component';
import {TimeAgoPipe} from '../../shared/date/timeago.pipe';
import {DurationPipe} from '../../shared/file/duration.pipe';

@Component({
  directives: [SpinnerComponent, ImageLoaderComponent, ROUTER_DIRECTIVES],
  pipes: [DatePipe, TimeAgoPipe, DurationPipe],
  selector: 'home-series',
  styleUrls: ['app/home/directives/home-series.component.css'],
  template: `
    <header>
      <a href="#">
        <image-loader [src]="seriesImage"></image-loader>
      </a>
      <p class="count">{{series.count("prx:stories")}} Stories</p>
      <h1><a href="#">{{series.title}}</a></h1>
      <p class="updated">Last updated {{seriesUpdated | timeago}}</p>
    </header>
    <div class="story-list">
      <div *ngFor="let story of stories" class="story">
        <a [routerLink]="['/edit', story.id]">
          <image-loader [src]="story.storyImage"></image-loader>
        </a>
        <h2><a [routerLink]="['/edit', story.id]">{{story.title}}</a></h2>
        <p class="duration">{{story.storyAudioDuration | duration}}</p>
        <p class="modified">{{story.storyUpdated | date:"MM/dd/yy"}}</p>
      </div>
      <div *ngIf="!stories" *ngFor="let l of storyLoaders" class="story">
        <spinner></spinner>
      </div>
    </div>
  `
})

export class HomeSeriesComponent implements OnInit {

  @Input() series: HalDoc;
  @Input() rows: number = 1;

  seriesImage: string;
  seriesUpdated: Date;

  storyLoaders: any[];
  stories: HalDoc[];

  ngOnInit() {
    this.series.follow('prx:image').subscribe(
      img => this.seriesImage = img.expand('enclosure'),
      err => this.seriesImage = null
    );
    this.seriesUpdated = new Date(this.series['updatedAt']);

    let total = this.series.count('prx:stories');
    let max = (this.rows * 5) - 1;
    let limit = Math.min(total, max);
    this.storyLoaders = Array(limit - 1);

    this.series.followItems('prx:stories', {per: limit}).subscribe((stories) => {
      stories.forEach((story) => {
        story['storyUpdated'] = new Date(story['updatedAt']);
        story.follow('prx:image').subscribe(
          img => story['storyImage'] = img.expand('enclosure'),
          err => story['storyImage'] = null
        );
        story.followItems('prx:audio').subscribe((audios) => {
          if (!audios || audios.length < 1) {
            story['storyAudioDuration'] = 0;
          } else {
            story['storyAudioDuration'] = audios.map((audio) => {
              return audio['duration'] || 0;
            }).reduce((prevDuration, currDuration) => {
              return prevDuration + currDuration;
            });
          }
        });
      });
      this.stories = stories;
    });
    console.log(this.series);
  }

}
