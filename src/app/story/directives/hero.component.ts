import { Component, Input, OnInit, OnChanges, DoCheck } from '@angular/core';
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
        <h1 *ngIf="id">Edit Episode</h1>
        <h1 *ngIf="!id">Create Episode</h1>
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
        <publish-button [model]="story" working=0 disabled=0 plain=1
          (click)="discard()">Discard</publish-button>

        <template [ngIf]="stateNew">
          <publish-button green=1 [model]="story" [disabled]="normalInvalid"
              visible=1 (click)="save()">Create
            <div *ngIf="normalInvalid" class="invalid-tip create">
              <h4>Invalid episode</h4>
              <p>Add a title and resolve validation errors</p>
            </div>
          </publish-button>
        </template>

        <template [ngIf]="stateUnpublished">
          <publish-button [model]="story" [disabled]="normalInvalid" (click)="save()">Save
            <div *ngIf="normalInvalid" class="invalid-tip">
              <h4>Invalid episode</h4>
              <p>Resolve all validation errors</p>
            </div>
          </publish-button>
          <publish-button [model]="story" [visible]="!story.changed()" [disabled]="strictInvalid"
              [working]="isPublishing" (click)="togglePublish()" orange=1>Publish
            <div *ngIf="strictInvalid" class="invalid-tip publish">
              <h4>Not ready to publish</h4>
              <p>Fill out all required fields</p>
            </div>
          </publish-button>
        </template>

        <template [ngIf]="statePublished">
          <publish-button [model]="story" (click)="save()" [disabled]="strictInvalid">Save
            <div *ngIf="strictInvalid" class="invalid-tip">
              <h4>Invalid episode</h4>
              <p>Resolve all validation errors</p>
            </div>
          </publish-button>
          <publish-button [model]="story" [visible]="!story.changed()" [working]="isPublishing"
            (click)="togglePublish()" orange=1>Unpublish</publish-button>
        </template>

      </div>
    </publish-hero>
    `
})

export class StoryHeroComponent implements OnInit, OnChanges, DoCheck {

  @Input() id: number;
  @Input() story: StoryModel;

  series: HalDoc;

  stateNew: boolean;
  stateUnpublished: boolean;
  statePublished: boolean;
  isPublishing: boolean;

  strictInvalid: string;
  normalInvalid: string;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateBanner();
  }

  ngOnChanges() {
    this.updateBanner();
  }

  ngDoCheck() {
    if (this.story) {
      this.stateNew = this.story.isNew;
      this.stateUnpublished = !this.stateNew && !this.story.publishedAt;
      this.statePublished = !this.stateNew && !this.stateUnpublished;
      this.strictInvalid = this.story.invalid(null, true);
      this.normalInvalid = this.story.invalid(null, false);
    }
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
    this.isPublishing = true;
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      this.isPublishing = false;
    });
  }

  formatDatetime(date) {
    return moment(date).format('L LT');
  }

  get publishedOnText() {
    if (this.story.isPublished()) {
      return `Published on ${this.formatDatetime(this.story.publishedAt)}`;
    } else {
      return `Will be published on ${this.formatDatetime(this.story.publishedAt)}`;
    }
  }

}
