import {Component, Input, OnInit} from '@angular/core';

import {HalDoc} from '../../shared/cms/haldoc';
import {StoryModel} from '../../storyedit/models/story.model';
import {SpinnerComponent} from '../../shared/spinner/spinner.component';
import {ImageLoaderComponent} from '../../shared/image/image-loader.component';
import {TimeAgoPipe} from '../../shared/date/timeago.pipe';
import {HomeStoryComponent} from './home-story.component';

@Component({
  directives: [SpinnerComponent, ImageLoaderComponent, HomeStoryComponent],
  pipes: [TimeAgoPipe],
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
      <home-story *ngFor="let s of stories" [story]="s"></home-story>
      <div *ngFor="let l of storyLoaders" class="story"><spinner></spinner></div>
    </div>
  `
})

export class HomeSeriesComponent implements OnInit {

  PER_ROW = 5;

  @Input() series: HalDoc;
  @Input() rows: number = 1;

  seriesImage: string;
  seriesUpdated: Date;
  stories: StoryModel[];
  storyLoaders: boolean[];

  ngOnInit() {
    this.series.follow('prx:image').subscribe(
      img => this.seriesImage = img.expand('enclosure'),
      err => this.seriesImage = null
    );
    this.seriesUpdated = new Date(this.series['updatedAt']);

    // how many stories to display? (plus 1 new/draft story)
    let total = this.series.count('prx:stories');
    let max = (this.rows * this.PER_ROW) - 1; // placeholder
    let limit = Math.min(total, max);
    this.storyLoaders = Array(limit + 1);

    this.series.followItems('prx:stories', {per: limit}).subscribe((stories) => {
      this.storyLoaders = null;
      this.stories = [new StoryModel(this.series)];
      for (let story of stories) {
        this.stories.push(new StoryModel(this.series, story, false));
      }
    });
  }

}
