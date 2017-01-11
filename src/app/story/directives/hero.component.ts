import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <publish-hero>
      <div class="hero-title">
        <h1 *ngIf="id">Edit Story</h1>
        <h1 *ngIf="!id">Create Story</h1>
        <a *ngIf="series" class="series" [routerLink]="['/series', series.id]">
          <publish-image [imageDoc]="series"></publish-image>
          <h3>{{series.title || '(Untitled Series)'}}</h3>
        </a>
      </div>
      <div class="hero-info" *ngIf="story">
        <h2>{{story.title || '(Untitled)'}}</h2>
        <p *ngIf="story?.isNew">Not saved</p>
        <p *ngIf="!story?.isNew && !story?.publishedAt">Last saved at {{story.updatedAt | timeago}}</p>
        <p *ngIf="story?.publishedAt">{{publishedOnText}}</p>
      </div>
      <div class="hero-actions" *ngIf="story">

        <template [ngIf]="story.isNew">
          <publish-button [model]="story" plain=1 working=0 disabled=0 (click)="discard()">Discard</publish-button>
          <publish-button [model]="story" visible=1 green=1 (click)="save()">Create
            <div *ngIf="story.invalid()" class="invalid-tip create">
              <h4>Invalid story</h4>
              <p>Fill out all required fields</p>
            </div>
          </publish-button>
        </template>

        <template [ngIf]="!story.isNew">
          <publish-button [model]="story" plain=1 working=0 disabled=0 (click)="discard()">Discard</publish-button>
          <publish-button [model]="story" (click)="save()">Save
            <div *ngIf="story.invalid()" class="invalid-tip">
              <h4>Invalid changes</h4>
              <p>Correct them before saving</p>
            </div>
          </publish-button>
          <publish-button [model]="story" [visible]="!story.changed()"
             [working]="story.isPublishing" (click)="togglePublish()" orange=1>
            {{story.publishedAt ? 'Unpublish' : 'Publish'}}
          </publish-button>
        </template>

      </div>
    </publish-hero>
    `
})

export class StoryHeroComponent implements OnInit, OnChanges {

  @Input() id: number;
  @Input() story: StoryModel;

  series: HalDoc;

  now = new Date(); // value changed after checked if new Date() in getter

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateBanner();
  }

  ngOnChanges() {
    this.updateBanner();
  }

  updateBanner() {
    if (this.story) {
      if (this.story.isNew && this.story.parent && this.story.parent.isa('series')) {
        this.series = this.story.parent;
      } else if (!this.story.isNew && this.story.doc.has('prx:series')) {
        this.story.doc.follow('prx:series').subscribe(e => this.series = e);
      }
    }
  }

  save() {
    let wasNew = this.story.isNew;
    this.story.save().subscribe(() => {
      if (wasNew) {
        this.router.navigate(['/story', this.story.id]);
      }
    });
  }

  discard() {
    this.story.discard();
  }

  togglePublish() {
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      // nothing to do
    });
  }

  formatDatetime(date) {
    return moment(date).format('L LT');
  }

  get publishedOnText() {
    if (this.now.valueOf() >= new Date(this.story.publishedAt.valueOf()).valueOf()) {
      return `Published on ${this.formatDatetime(this.story.publishedAt)}`;
    } else {
      return `Will be published on ${this.formatDatetime(this.story.publishedAt)}`;
    }
  }

}
