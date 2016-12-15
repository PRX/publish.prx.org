import { Component, Input, OnInit } from '@angular/core';
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
        <publish-image [src]="storyImage" ></publish-image>
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

  storyId: number;
  storyTitle: string;
  storyUpdated: Date;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.storyId = this.story.id;
    this.storyTitle = this.story.title;
    this.storyUpdated = this.story.lastStored || this.story.updatedAt;

    if (this.story.isNew) {
      this.editLink = ['story/new'];
      if (this.story.parent) {
        this.editLink.push(this.story.parent.id);
      }
    } else {
      this.editLink = ['/story', this.story.id];
    }

    if (this.story.isNew) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (this.story.changed()) {
      this.statusClass = 'status unsaved';
      this.statusText = 'Unsaved Changes';
    } else if (!this.story.publishedAt) {
      this.statusClass = 'status unpublished';
      this.statusText = 'Private';
    }
  }

  get isPlusSign(): boolean {
    return this.story.isNew && !this.story.changed();
  }

  get storyDuration(): number {
    let duration = 0;
    if (this.story.versions && this.story.versions.length > 0) {
      if (this.story.versions[0].files.length > 0) {
        duration = this.story.versions[0].files.filter((audio) => !audio.isDestroy).map((audio) => {
          return audio['duration'] || 0;
        }).reduce((prevDuration, currDuration) => {
          return prevDuration + currDuration;
        });
      }
    }
    return duration;
  }

  get storyImage(): string {
    if (this.story.isNew) {
      return this.story.unsavedImage ? this.story.unsavedImage.enclosureHref : null;
    } else {
      return this.story.images.length > 0 ? this.story.images[0].enclosureHref : '';
    }
  }
}
