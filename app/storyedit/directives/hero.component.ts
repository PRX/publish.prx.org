import {Component, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

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
      <section>
        <spinner *ngIf="!story" inverse=true></spinner>
        <div class="info" *ngIf="story">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p *ngIf="story.isNew">Not saved</p>
          <p *ngIf="!story.isNew">Last saved at {{story.updatedAt | timeago}}</p>
        </div>
        <div class="actions" *ngIf="story">
          <button class="preview" [disabled]="story.isSaving">Preview</button>
          <button *ngIf="story.isNew" class="create" [class.saving]="story.isSaving"
            [disabled]="story.invalid() || story.isSaving"
            (click)="save()">Create <spinner *ngIf="story.isSaving"></spinner></button>
          <button *ngIf="!story.isNew" class="save" [class.saving]="story.isSaving"
            [disabled]="story.invalid() || !story.changed() || story.isSaving"
            (click)="save()">Save <spinner *ngIf="story.isSaving"></spinner></button>
          <button *ngIf="!story.isNew" class="publish"
            [disabled]="story.invalid() || story.changed() || story.isSaving"
            (click)="publish()">
            Publish
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
        if (this.story.parent.isa('series')) {
          this.bannerTitle = this.story.parent['title'] || '(Untitled Series)';
        } else {
          this.bannerTitle = this.story.parent['name'] || '(Unnnamed Account)';
        }
        if (this.story.parent.has('prx:image')) {
          this.story.parent.follow('prx:image')
            .subscribe(img => this.bannerLogo = img.expand('enclosure'));
        }
      } else {
        this.bannerTitle = '(No series or account!)';
      }
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  onScroll(): void {
    this.affixed = (window.scrollY > 200);
  }

  save(): void {
    let wasNew = this.story.isNew;
    this.story.save().subscribe(() => {
      if (wasNew) {
        this.router.navigate(['/edit', {id: this.story.id}]);
      }
    });
  }

}
