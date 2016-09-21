import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { HalDoc } from '../../shared/cms/haldoc';
import { DurationPipe, ImageLoaderComponent, StoryModel } from '../../shared';

@Component({
  directives: [ImageLoaderComponent, ROUTER_DIRECTIVES],
  pipes: [DatePipe, DurationPipe],
  selector: 'publish-search-story',
  styleUrls: ['search-story.component.css'],
  template: `
    <div>
      <section class="story-image">
        <image-loader [imageDoc]="story.doc"></image-loader>
        <p *ngIf="statusClass" [class]="statusClass">{{statusText}}</p>
      </section>
      <section class="story-detail">
        <h2 class="story-title"><a [routerLink]="editStoryLink">{{storyTitle}}</a></h2>
        
        <h3 *ngIf="seriesLink" class="series-title"><a [routerLink]="seriesLink">{{seriesTitle}}</a></h3>
        <h3 *ngIf="!seriesLink" class="series-title">{{seriesTitle}}</h3>
        
        <p class="meta">
          <span class="duration">{{storyDuration | duration}}</span>
          <span *ngIf="storyAudioTotal" class="audio-total"><i class="icon-up-dir"></i>{{storyAudioTotal}}</span>
          <span class="modified">{{storyUpdated | date:"MM/dd/yy"}}</span>
        </p>
      </section>
      <section class="story-tags">
        <span *ngFor="let tag of storyTags">{{tag}}</span>          
      </section>
      <section class="story-description three-lines" [ngClass]="{'two-lines': storyTags.length > 0 }">
        {{storyDescription}}
      </section>
    </div>
  `
})

export class SearchStoryComponent implements OnInit {

  @Input() story: StoryModel;

  editStoryLink: any[];
  seriesLink: any[];

  storyId: number;
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
    this.storyTitle = this.story.title;
    this.storyUpdated = this.story.lastStored || this.story.updatedAt;
    this.storyDescription = this.story.shortDescription;
    this.storyTags = this.story.extraTags && this.story.extraTags.length > 0 ? this.story.extraTags.split(', ') : [];

    this.editStoryLink = ['/edit', this.story.id];

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

    if (this.story.parent) {
      this.seriesTitle = this.story.parent['title'];
      this.seriesLink = ['/series', this.story.parent.id];
    } else {
      this.seriesTitle = this.story.account['name'] || '(Unnamed Account)';
    }

    if (!this.story.publishedAt) {
      this.statusClass = 'status unpublished';
      this.statusText = 'Unpublished';
    }
  }

}
