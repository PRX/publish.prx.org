import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel } from '../../shared';
import { CATEGORIES, SUBCATEGORIES } from '../../shared/model/story.categories';
import { StoryTabService } from '../services/story-tab.service';

@Component({
  styleUrls: ['edit.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field [model]="story" textarea="true" name="title" label="Story Title" required>
        <div class="fancy-hint">Write a short, Tweetable title like a newspaper headline. Make viewers
          want to click on your piece from the title alone.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textarea="true" name="shortDescription" label="Teaser" required>
        <div class="fancy-hint">A first impression; think of this as the single-item lead of a piece.</div>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field label="Story Versions" required>
        <publish-audio-upload [story]="story"></publish-audio-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field [model]="story" label="Tag your Story" invalid="tags" invalidlabel="" required>
        <div class="fancy-hint">Adding tags that are relevant to your piece helps people find your work
          on PRX and can help you be licensed and heard.</div>
        <div class="span-fields">
          <publish-fancy-field [model]="story" [select]="GENRES" name="genre" label="Genre"
            small="true" required></publish-fancy-field>
          <publish-fancy-field [model]="story" [select]="SUBGENRES" name="subGenre" label="SubGenre"
            small="true" required></publish-fancy-field>
        </div>
        <publish-fancy-field [model]="story" textinput="true" name="extraTags"
          label="Extra Tags" small="true"></publish-fancy-field>
      </publish-fancy-field>

    </form>
  `
})

export class EditComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: StoryTabService) {
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
    });
  }

  get GENRES(): string[] {
    return CATEGORIES;
  }

  get SUBGENRES(): string[] {
    if (this.story && this.story.genre) {
      return SUBCATEGORIES[this.story.genre];
    } else {
      return [];
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
