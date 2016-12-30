import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

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
        <p *ngIf="!story?.isNew">Last saved at {{story.updatedAt | timeago}}</p>
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
          <span *ngIf="!story.changed() && !this.story.publishedAt">
            <publish-datepicker 
              [date]="pendingPublishedAt" (onDateChange)="pendingPublishedAt">            
            </publish-datepicker>
            <select
              [(ngModel)]="pendingPublishedAtHour">
              <option *ngFor="let h of hourOptions" [value]="h">{{h}}</option>
            </select> :
            <select
              [(ngModel)]="pendingPublishedAtMinutes">
              <option *ngFor="let m of minuteOptions" [value]="m">{{m}}</option>
            </select>
          </span>
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

  private _pendingPublishedAt: Date;
  hourOptions: string[] = new Array(24).fill('').map((x, i) => i < 10 ? '0' + i : '' + i);
  minuteOptions = ['00', '30'];

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

  get pendingPublishedAt(): Date {
    if (!this.story.publishedAt && !this._pendingPublishedAt) {
      // really only want to set this once and story.publishedAt not ready when component is instantiated
      this._pendingPublishedAt = new Date();
    }
    if (this.story.publishedAt && typeof this.story.publishedAt === "string") {
      // story.publishedAt supposed to be a Date but it's actually a string ಠ_ಠ
      // so assigning it to the Date value so it doesn't have to parse the string to a Date over and over and over again
      this.story.publishedAt = new Date(this.story.publishedAt);
      return this.story.publishedAt;
    } else if (this.story.publishedAt) {
      return this.story.publishedAt;
    } else {
      return this._pendingPublishedAt;
    }
  }

  set pendingPublishedAt(date: Date) {
    this._pendingPublishedAt = date;
  }

  get pendingPublishedAtHour(): string {
    if (this.pendingPublishedAt.getMinutes() <= 30) {
      return this.pendingPublishedAt.getHours() < 10 ? '0' + this.pendingPublishedAt.getHours() :'' + this.pendingPublishedAt.getHours();
    } else {
      return this.pendingPublishedAt.getHours() + 1 <= 23 ? '' + (this.pendingPublishedAt.getHours() + 1) : '00';
    }
  }

  set pendingPublishedAtHour(hour: string) {
    this._pendingPublishedAt.setHours(Number(hour));
  }

  get pendingPublishedAtMinutes(): string {
    return this.pendingPublishedAt.getMinutes() <= 30 ? '30' : '00';
  }

  set pendingPublishedAtMinutes(minutes: string) {
    this._pendingPublishedAt.setMinutes(Number(minutes));
  }

  togglePublish() {
    if (!this.story.publishedAt) {
      this.story.set('publishedAt', this._pendingPublishedAt);
    }
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      // nothing to do
    });
  }

}
