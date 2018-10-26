import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Component, Input, OnInit } from '@angular/core';
import { HalDoc } from '../../core';

@Component({
  selector: 'publish-story-card',
  styleUrls: ['story-card.component.css'],
  template: `
    <section class="story-image">
      <prx-image [imageDoc]="story"></prx-image>
      <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
    </section>
    <section class="story-detail">
      <h2 class="story-title"><a [routerLink]="editStoryLink">{{storyTitle}}</a></h2>
      <h3 class="series-title">{{seriesTitle | async}}</h3>

      <section class="story-info">
        <span>{{storyDuration | duration}}</span>
        <span>{{storyDate | date:"MM/dd/yy"}}</span>
      </section>
    </section>
    <section class="story-tags">
      <span *ngFor="let tag of storyTags">{{tag}}</span>
    </section>
    <section class="story-description">
      <publish-text-overflow-fade [numLines]="storyTags.length > 0 ? 2 : 3" lineHeight="20" unit="px">
        <span title="{{storyDescription}}">{{storyDescription}}</span>
      </publish-text-overflow-fade>
    </section>
  `
})

export class StoryCardComponent implements OnInit {

  @Input() story: HalDoc;

  editStoryLink: any[];

  storyId: number;
  storyTitle: string;
  storyDuration: number;
  storyDate: Date;
  storyDescription: string;
  storyTags: string[];
  seriesTitle: Observable<string>;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.storyId = this.story.id;
    this.storyTitle = this.story['title'];
    this.storyDate = this.story['publishedAt'];
    this.storyDescription = this.story['shortDescription'];
    this.storyTags = this.story['tags'];
    this.storyDuration = this.story['duration'] || 0;
    this.editStoryLink = ['/story', this.story.id];

    if (this.story.has('prx:series')) {
      this.seriesTitle = this.story.follow('prx:series').map(doc => doc['title'] || '(Untitled Series)');
    } else if (this.story.has('prx:account')) {
      this.seriesTitle = this.story.follow('prx:account').map(doc => doc['name'] || '(Unnamed Account)');
    } else {
      this.seriesTitle = Observable.of('(Unknown Series)');
    }

    if (!this.story['publishedAt']) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (new Date().valueOf() < new Date(this.story['publishedAt']).valueOf()) {
      this.statusClass = 'status scheduled';
      this.statusText = 'Scheduled';
    } else {
      this.statusClass = null;
      this.statusText = null;
    }
  }

}
