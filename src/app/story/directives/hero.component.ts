import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { HeroComponent, ButtonComponent } from '../../shared';
import { HalDoc, ImageLoaderComponent, StoryModel, TimeAgoPipe } from '../../shared';
import { StoryTabService } from '../services/story-tab.service';

@Component({
  directives: [HeroComponent, ButtonComponent, ImageLoaderComponent],
  pipes: [TimeAgoPipe],
  selector: 'publish-story-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <publish-hero>
      <hero-title *ngIf="bannerTitle">
        <h1 *ngIf="story.isNew">Create Story</h1>
        <h1 *ngIf="!story.isNew">Edit Story</h1>
        <div class="story-series">
          <image-loader [imageDoc]="bannerLogoDoc"></image-loader>
          <h2 *ngIf="bannerLink"><a [href]="bannerLink">{{bannerTitle}}</a></h2>
          <h2 *ngIf="!bannerLink">{{bannerTitle}}</h2>
        </div>
      </hero-title>
      <hero-info *ngIf="story">
        <h2>{{story.title || '(Untitled)'}}</h2>
        <p *ngIf="story?.isNew">Not saved</p>
        <p *ngIf="!story?.isNew">Last saved at {{story.updatedAt | timeago}}</p>
      </hero-info>
      <hero-actions *ngIf="story">

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

      </hero-actions>
    </publish-hero>
    `
})

export class StoryHeroComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;
  bannerTitle: string;
  bannerLink: string;
  bannerLogoDoc: HalDoc;

  constructor(private router: Router, private tab: StoryTabService) {
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
      if (this.story.parent) {
        this.bannerTitle = this.story.parent['title'] || '(Untitled Series)';
        this.bannerLink = `/series/${this.story.parent.id}`;
        this.bannerLogoDoc = this.story.parent;
      } else {
        this.bannerTitle = this.story.account['name'] || '(Unnnamed Account)';
        this.bannerLink = null;
        this.bannerLogoDoc = this.story.account;
      }
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  save() {
    let wasNew = this.story.isNew;
    this.story.save().subscribe(() => {
      if (wasNew) {
        this.router.navigate(['/edit', this.story.id]);
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
