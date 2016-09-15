import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { HalDoc } from '../../shared/cms/haldoc';
import { DurationPipe, ImageLoaderComponent, OverflowComponent, StoryModel } from '../../shared';

@Component({
  directives: [ImageLoaderComponent, OverflowComponent, ROUTER_DIRECTIVES],
  pipes: [DatePipe, DurationPipe],
  selector: 'search-story',
  styleUrls: ['search-story.component.css'],
  template: `
    <div class="media-container">
      <section class="story-link">
        <a [routerLink]="editStoryLink">
          <image-loader [src]="storyImage" [imageDoc]="storyImageDoc"></image-loader>
        </a>
        <h2>
          <a *ngIf="storyTitle" [routerLink]="editStoryLink">{{storyTitle}}</a>
          <a *ngIf="!storyTitle" [routerLink]="editStoryLink">(Untitled)</a>
        </h2>
        <p class="duration">{{storyDuration | duration}}</p>
        <p class="modified">{{storyUpdated | date:"MM/dd/yy"}}</p>
        <p *ngIf="storyAudioTotal" class="audio-total"><i class="icon-up-dir"></i>{{storyAudioTotal}}</p>
        <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
      </section>
      <section class="story-detail">
        <a *ngIf="seriesLink" [routerLink]="seriesLink">{{seriesTitle}}</a>
        <h3 *ngIf="!seriesLink">{{seriesTitle}}</h3>
        <overflow [overflowText]="storyDescription"></overflow>
        <section class="story-tags">
          <span *ngFor="let tag of storyTags">{{tag}}</span>          
        </section>
      </section>
    </div>
  `
})

export class SearchStoryComponent implements OnInit {

  @Input() story: StoryModel;

  editStoryLink: any[];
  seriesLink: any[];
  isEmptyDraft: boolean;

  storyId: number;
  storyImage: string;
  storyImageDoc: HalDoc;
  storyTitle: string;
  storyDuration: number;
  storyAudioTotal: number;
  storyUpdated: Date;
  storyDescription: string;
  storyTags: string[];
  seriesTitle: string;

  statusClass: string;
  statusText: string;

  ngOnInit() {
    this.storyId = this.story.id;
    this.isEmptyDraft = this.story.isNew && !this.story.isStored();
    this.storyTitle = this.story.title;
    this.storyUpdated = this.story.lastStored || this.story.updatedAt;
    this.storyDescription = this.story.shortDescription;
    this.storyTags = this.story.extraTags && this.story.extraTags.length > 0 ? this.story.extraTags.split(', ') : [];

    if (this.story.isNew) {
      this.editStoryLink = ['/create'];
      if (this.story.parent) {
        this.editStoryLink.push(this.story.parent.id);
      }
    } else {
      this.editStoryLink = ['/edit', this.story.id];
    }

    // TODO: draft audios
    if (this.story.isNew) {
      this.storyImage = this.story.unsavedImage ? this.story.unsavedImage.enclosureHref : null;
      this.storyDuration = 0;
    } else {
      this.storyImageDoc = this.story.doc;
      if (this.story.doc.has('prx:audio')) {
        this.story.doc.followItems('prx:audio').subscribe((audios) => {
          let audiosDocs = <HalDoc[]> audios;
          if (!audios || audios.length < 1) {
            this.storyDuration = 0;
          } else {
            this.storyAudioTotal = audiosDocs[0].total();
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
      // TODO: a lot of these stories on the search page will likely be from the same series, not good that it's querying it for each just for the title
      if (this.story.parent) {
        this.seriesTitle = this.story.parent['title'];
        this.seriesLink = ['/series', this.story.parent.id];
      } else {
        this.seriesTitle = this.story.account['name'] || '(Unnamed Account)';
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
