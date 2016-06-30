import {Component, Input, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {ImageLoaderComponent} from '../../shared/image/image-loader.component';
import {DurationPipe} from '../../shared/file/duration.pipe';
import {StoryModel} from '../../storyedit/models/story.model';

@Component({
  directives: [ImageLoaderComponent, ROUTER_DIRECTIVES],
  pipes: [DatePipe, DurationPipe],
  selector: 'home-story',
  styleUrls: ['app/home/directives/home-story.component.css'],
  template: `
    <template [ngIf]="isPlusSign">
      <a [routerLink]="editLink" class="plus-sign">
        <i class="icon-plus"></i>
        <p>New Story</p>
      </a>
    </template>
    <template [ngIf]="!isPlusSign">
      <a [routerLink]="editLink">
        <image-loader *ngIf="storyImage" [src]="storyImage"></image-loader>
        <div *ngIf="!storyImage" class="no-image">No Image</div>
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
      if (this.story.parent && this.story.parent.isa('series')) {
        this.editLink.push(this.story.parent.id);
      }
    } else {
      this.editLink = ['/edit', this.story.id];
    }

    // TODO: draft images/audios
    if (this.story.isNew) {
      this.storyImage = null;
      this.storyDuration = 0;
    } else {
      if (this.story.doc.has('prx:image')) {
        this.story.doc.follow('prx:image').subscribe(
          img => this.storyImage = img.expand('enclosure'),
          err => this.storyImage = null
        );
      }
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
