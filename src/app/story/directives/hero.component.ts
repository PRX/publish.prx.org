import { Component, Input, OnInit, OnChanges, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { HalDoc } from '../../core';
import { ToastrService } from 'ngx-prx-styleguide';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <prx-hero>
      <div class="hero-title">
        <h1 *ngIf="id">Edit Episode</h1>
        <h1 *ngIf="!id">Create Episode</h1>
        <a *ngIf="series" class="series" [routerLink]="['/series', series.id]">
          <prx-image [imageDoc]="series"></prx-image>
          <h3>{{series.title || '(Untitled Series)'}}</h3>
        </a>
      </div>
      <div class="hero-info" *ngIf="story">
        <h2>{{story.title || '(Untitled)'}}</h2>
        <p *ngIf="story?.isNew">Not saved</p>
        <p *ngIf="!story?.isNew">Last saved at {{story.updatedAt | timeago}}</p>
      </div>
      <div class="hero-actions" *ngIf="story">
        <prx-button [model]="story" working=0 disabled=0 plain=1
          [visible]="isChanged" (click)="discard()">Discard</prx-button>
        <prx-button [model]="story" [visible]="isChanged || story.isNew"
          [disabled]="isInvalid" (click)="save()">Save</prx-button>
        <prx-button *ngIf="!story.isNew" working=0 disabled=1
          [visible]="!isChanged">Saved</prx-button>
      </div>
    </prx-hero>
    `
})

export class StoryHeroComponent implements OnInit, OnChanges, DoCheck {

  @Input() id: number;
  @Input() story: StoryModel;

  series: HalDoc;
  isChanged: boolean;
  isInvalid: string;

  constructor(private router: Router,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.updateBanner();
  }

  ngOnChanges(changes: any) {
    this.updateBanner();
  }

  ngDoCheck() {
    if (this.story) {
      this.isChanged = this.story.changed();
      if (this.story.isNew || !this.story.publishedAt) {
        this.isInvalid = this.story.invalid(null, false);
      } else {
        this.isInvalid = this.story.invalid(null, true); // strict
      }
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
      this.toastr.success('Episode saved');
      if (wasNew) {
        this.router.navigate(['/story', this.story.id]);
      }
    });
  }

  discard() {
    this.story.discard();
  }

}
