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
        <p>New Story</p>
      </a>
    </template>
    <template [ngIf]="!isPlusSign">
      <a [routerLink]="editLink">
        <publish-image [src]="storyImage" [imageDoc]="storyImageDoc"></publish-image>
      </a>
      <h2>
        <a *ngIf="storyTitle" [routerLink]="editLink">{{storyTitle}}</a>
        <a *ngIf="!storyTitle" [routerLink]="editLink">(Untitled)</a>
      </h2>
      <p class="duration">{{storyDuration | duration}}</p>
      <p class="modified">{{storyUpdated | date:"MM/dd/yy"}}</p>
      <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
    </template>
  `
})

export class HomeStoryComponent implements OnInit {

  @Input() story: StoryModel;

  editLink: any[];
  isPlusSign: boolean;

  storyId: number;
  storyImage: string;
  storyImageDoc: HalDoc;
  storyTitle: string;
  storyDuration: number;
  storyUpdated: Date;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.storyId = this.story.id;
    this.isPlusSign = this.story.isNew && !this.story.isStored();
    this.storyTitle = this.story.title;
    this.storyUpdated = this.story.lastStored || this.story.updatedAt;

    if (this.story.isNew) {
      this.editLink = ['/create'];
      if (this.story.parent) {
        this.editLink.push(this.story.parent.id);
      }
    } else {
      this.editLink = ['/edit', this.story.id];
    }

    // TODO: draft audios
    if (this.story.isNew) {
      this.storyImage = this.story.unsavedImage ? this.story.unsavedImage.enclosureHref : null;
      this.storyDuration = 0;
    } else {
      this.storyImageDoc = this.story.doc;
      if (this.story.doc.has('prx:audio')) {
        this.story.doc.followItems('prx:audio').subscribe((audios) => {
          if (!audios || audios.length < 1) {
            this.storyDuration = 0;
          } else {
            this.storyDuration = audios.map((audio) => {
              return audio['duration'] || 0;
            }).reduce((prevDuration, currDuration) => {
              return prevDuration + currDuration;
            });
          }
        });
      } else {
        this.storyDuration = 0;
      }
    }

    if (this.story.isNew) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (this.story.changed()) {
      this.statusClass = 'status unsaved';
      this.statusText = 'Edited';
    } else if (!this.story.publishedAt) {
      this.statusClass = 'status unpublished';
      this.statusText = 'Unpublished';
    }
  }

}
