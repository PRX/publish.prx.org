import {Component, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {HalDoc, HalObservable} from '../../shared/cms/haldoc';
import {StoryModel} from '../models/story.model';
import {StoryTabService} from '../services/storytab.service';
import {SpinnerComponent} from '../../shared/spinner/spinner.component';
import {ImageLoaderComponent} from '../../shared/image/image-loader.component';
import {TimeAgoPipe} from '../../shared/date/timeago.pipe';

@Component({
  directives: [SpinnerComponent, ImageLoaderComponent],
  pipes: [TimeAgoPipe],
  selector: 'publish-story-hero',
  styleUrls: ['app/storyedit/directives/hero.component.css'],
  template: `
    <div class="hero banner">
      <section>
        <spinner *ngIf="!bannerTitle"></spinner>
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
        <spinner inverse=true></spinner>
      </section>
      <section *ngIf="story?.isNew">
        <div class="info">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p>Not saved</p>
        </div>
        <div class="actions">
          <button class="create" [class.saving]="story.isSaving"
            [disabled]="story.invalid() || story.isSaving"
            (click)="save()">Create <spinner *ngIf="story.isSaving"></spinner></button>
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
            <spinner *ngIf="story.isSaving"></spinner>
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
            <spinner *ngIf="story.isPublishing"></spinner>
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
  bannerLogo: string;

  constructor(private router: Router, private tab: StoryTabService) {
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
      if (this.story.parent) {
        this.bannerTitle = this.story.parent['title'] || '(Untitled Series)';
        this.setBannerLogo(this.story.parent);
      } else {
        this.bannerTitle = this.story.account['name'] || '(Unnnamed Account)';
        this.setBannerLogo(this.story.account);
      }
    });
  }

  setBannerLogo(doc: HalDoc) {
    if (doc.has('prx:image')) {
      doc.follow('prx:image').subscribe(img => this.bannerLogo = img.expand('enclosure'));
    }
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
