import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <publish-hero>
      <div class="hero-title" *ngIf="bannerTitle">
        <h1 *ngIf="story.isNew">Create Story</h1>
        <h1 *ngIf="!story.isNew">Edit Story</h1>
        <div class="story-series">
          <publish-image [imageDoc]="bannerLogoDoc"></publish-image>
          <h2 *ngIf="bannerLink"><a [href]="bannerLink">{{bannerTitle}}</a></h2>
          <h2 *ngIf="!bannerLink">{{bannerTitle}}</h2>
        </div>
      </div>
      <div class="hero-info" *ngIf="story">
        <h2>{{story.title || '(Untitled)'}}</h2>
        <p *ngIf="story?.isNew">Not saved</p>
        <p *ngIf="!story?.isNew">Last saved at {{story.updatedAt | timeago}}</p>
      </div>
      <div class="hero-actions" *ngIf="story">

        <template [ngIf]="story.isNew">
          <publish-button [model]="story" plain=1 working=0 disabled=0 (click)="discard()">Discard</publish-button>
          <publish-button [model]="story" visible=1 orange=1 (click)="save()">Create</publish-button>
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

  @Input() story: StoryModel;

  bannerTitle: string;
  bannerLink: string;
  bannerLogoDoc: HalDoc;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateBanner();
  }

  ngOnChanges() {
    this.updateBanner();
  }

  updateBanner() {
    if (this.story && this.story.parent) {
      this.bannerTitle = this.story.parent['title'] || '(Untitled Series)';
      this.bannerLink = `/series/${this.story.parent.id}`;
      this.bannerLogoDoc = this.story.parent;
    } else if (this.story ) {
      this.bannerTitle = this.story.account['name'] || '(Unnamed Account)';
      this.bannerLink = null;
      this.bannerLogoDoc = this.story.account;
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

}
