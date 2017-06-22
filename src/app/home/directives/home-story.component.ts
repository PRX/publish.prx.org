import { Component, Input, OnInit } from '@angular/core';
import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-home-story',
  styleUrls: ['home-story.component.css'],
  template: `
    <template [ngIf]="isPlusSign">
      <a [routerLink]="editLink" class="plus-sign">
        <i class="icon-plus"></i>
        <p>New Episode</p>
      </a>
    </template>
    <template [ngIf]="!isPlusSign">
      <a [routerLink]="editLink">
        <prx-image [imageDoc]="storyImage" ></prx-image>
      </a>
      <h2>
        <a *ngIf="storyTitle" [routerLink]="editLink">{{storyTitle}}</a>
        <a *ngIf="!storyTitle" [routerLink]="editLink">(Untitled)</a>
      </h2>
      <p class="duration">{{storyDuration | duration}}</p>
      <p class="modified">{{storyDate | date:"MM/dd/yy"}}</p>
      <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
    </template>
  `
})

export class HomeStoryComponent implements OnInit {

  @Input() story: StoryModel;

  isPlusSign: boolean;
  editLink: any[];

  storyTitle: string;
  storyDate: Date;
  storyDuration = 0;
  storyImage: HalDoc;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.isPlusSign = this.story.isNew && !this.story.changed();
    this.setLink();
    this.setStatus();
    this.loadData();
  }

  setLink() {
    if (this.story.isNew) {
      this.editLink = ['story/new'];
      if (this.story.parent) {
        this.editLink.push(this.story.parent.id);
      }
    } else {
      this.editLink = ['/story', this.story.id];
    }
  }

  setStatus() {
    if (this.story.isNew) {
      this.statusClass = 'status new';
      this.statusText = 'New';
    } else if (!this.story.publishedAt) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (!this.story.isPublished()) {
      this.statusClass = 'status scheduled';
      this.statusText = 'Scheduled';
    }
  }

  loadData() {
    this.storyTitle = this.story.title;
    this.storyDate = this.story.publishedAt || this.story.updatedAt || this.story.lastStored;
    if (this.story.doc) {
      this.storyDuration = this.story.doc['duration'] || 0;
      this.storyImage = this.story.doc;
    }
  }

}
