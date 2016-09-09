import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { HalDoc, ImageLoaderComponent, SpinnerComponent, StoryModel, TimeAgoPipe } from '../../shared';
import { StoryTabService } from '../services/story-tab.service';

@Component({
  directives: [SpinnerComponent, ImageLoaderComponent],
  pipes: [TimeAgoPipe],
  selector: 'publish-story-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <div class="hero banner">
      <section>
        <publish-spinner *ngIf="!bannerTitle"></publish-spinner>
        <header *ngIf="bannerTitle">
          <h1 *ngIf="story.isNew">Create Story</h1>
          <h1 *ngIf="!story.isNew">Edit Story</h1>
          <div>
            <image-loader [src]="bannerLogo"></image-loader>
            <h2>{{bannerTitle}}</h2>
          </div>
        </header>
      </section>
    </div>
    <div class="hero toolbar" [class.affix]="affixed" (window:scroll)="onScroll()">
      <section *ngIf="!story">
        <publish-spinner inverse=true></publish-spinner>
      </section>
      <section *ngIf="story?.isNew">
        <div class="info">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p>Not saved</p>
        </div>
        <div class="actions">
          <button class="create" [class.saving]="story.isSaving"
            [disabled]="story.invalid() || story.isSaving"
            (click)="save()">Create <publish-spinner *ngIf="story.isSaving"></publish-spinner></button>
        </div>
      </section>
      <section *ngIf="story?.doc">
        <div class="info">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p>Last saved at {{story.updatedAt | timeago}}</p>
        </div>
        <div class="actions">
          <button *ngIf="story.changed()" class="discard"
            [disabled]="story.isSaving" (click)="discard()">Discard Changes</button>
          <button *ngIf="story.changed()" class="save"
            [class.saving]="story.isSaving"
            [disabled]="story.invalid() || story.isSaving || story.isPublishing"
            (click)="save()">
            Save
            <publish-spinner *ngIf="story.isSaving"></publish-spinner>
            <div *ngIf="story.invalid()" class="invalid-tip">
              <h4>Invalid changes</h4>
              <p>Correct them before saving</p>
            </div>
          </button>
          <button class="publish"
            [class.publishing]="story.isPublishing"
            [disabled]="story.changed() || story.isSaving || story.isPublishing"
            (click)="togglePublish()">
            {{story.publishedAt ? 'Unpublish' : 'Publish'}}
            <publish-spinner *ngIf="story.isPublishing"></publish-spinner>
          </button>
        </div>
      </section>
    </div>
    <div class="spacer" [class.affix]="affixed"></div>
    `
})

export class HeroComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;
  affixed = false;
  bannerTitle: string;
  bannerLogoDoc: HalDoc;

  constructor(private router: Router, private tab: StoryTabService) {
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
      if (this.story.parent) {
        this.bannerTitle = this.story.parent['title'] || '(Untitled Series)';
        this.bannerLogoDoc = this.story.parent;
      } else {
        this.bannerTitle = this.story.account['name'] || '(Unnnamed Account)';
        this.bannerLogoDoc = this.story.account;
      }
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  onScroll() {
    this.affixed = (window.scrollY > 200);
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
