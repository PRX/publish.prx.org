import { Component, Input, OnInit } from '@angular/core';

import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-card',
  styleUrls: ['story-card.component.css'],
  template: `
    <section class="story-image">
      <publish-image [imageDoc]="story.doc"></publish-image>
      <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
    </section>
    <section class="story-detail">
      <h2 class="story-title"><a [routerLink]="editStoryLink">{{storyTitle}}</a></h2>
      <h3 class="series-title">{{seriesTitle}}</h3>

      <section class="story-info">
        <span class="duration">{{storyDuration | duration}}</span>
        <span class="play-count"><i></i></span>
        <span class="modified">{{storyDate | date:"MM/dd/yy"}}</span>
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

  @Input() story: StoryModel;

  editStoryLink: any[];

  storyId: number;
  storyTitle: string;
  storyDuration: number;
  storyDate: Date;
  storyDescription: string;
  storyTags: string[];
  seriesTitle: string;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.storyId = this.story.id;
    this.storyTitle = this.story.title;
    this.storyDate = this.story.publishedAt || this.story.updatedAt || this.story.lastStored;
    this.storyDescription = this.story.shortDescription;
    this.storyTags = this.story.splitTags();
    this.storyDuration = this.story.doc['duration'] || 0;
    this.editStoryLink = ['/story', this.story.id];

    if (this.story.parent) {
      this.seriesTitle = this.story.parent['title'];
    } else {
      this.seriesTitle = this.story.account['name'] || '(Unnamed Account)';
    }

    if (!this.story.publishedAt) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (!this.story.isPublished()) {
      this.statusClass = 'status scheduled';
      this.statusText = 'Scheduled';
    }
  }

}
