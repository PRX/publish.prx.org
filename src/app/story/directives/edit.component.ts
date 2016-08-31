import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, FancyFieldComponent } from '../../shared';
import { CATEGORIES, SUBCATEGORIES } from '../../shared/model/story.categories';
import { AudioUploadComponent } from '../../upload';
import { StoryTabService } from '../services/story-tab.service';

@Component({
  directives: [FancyFieldComponent, AudioUploadComponent],
  selector: 'newstory-edit',
  styleUrls: ['edit.component.css'],
  template: `
    <form *ngIf="story">

      <fancy-field [model]="story" textarea="true" name="title" label="Story Title" required>
        <hint>Write a short, Tweetable title like a newspaper headline. Make viewers
          want to click on your piece from the title alone.</hint>
      </fancy-field>

      <fancy-field [model]="story" textarea="true" name="shortDescription" label="Teaser" required>
        <hint>A first impression; think of this as the single-item lead of a piece.</hint>
      </fancy-field>

      <hr/>

      <fancy-field label="Story Versions" required>
        <audio-upload [story]="story"></audio-upload>
      </fancy-field>

      <hr/>

      <fancy-field [model]="story" label="Tag your Story" invalid="tags" invalidlabel="" required>
        <hint>Adding tags that are relevant to your piece helps people find your work
          on PRX and can help you be licensed and heard.</hint>
        <div class="span-fields">
          <fancy-field [model]="story" [select]="GENRES" name="genre" label="Genre"
            small="true" required></fancy-field>
          <fancy-field [model]="story" [select]="SUBGENRES" name="subGenre" label="SubGenre"
            small="true" required></fancy-field>
        </div>
        <fancy-field [model]="story" textinput="true" name="extraTags"
          label="Extra Tags" small="true"></fancy-field>
      </fancy-field>

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
