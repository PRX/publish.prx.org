import {Component, Input} from 'angular2/core';
import {StoryModel} from '../models/story.model';
import {CATEGORIES, SUBCATEGORIES} from '../models/story.categories';
import {StoryFieldComponent} from './storyfield.component';
import {UploadComponent} from '../../upload/upload.component';

@Component({
  directives: [StoryFieldComponent, UploadComponent],
  selector: 'newstory-edit',
  styleUrls: ['app/storyedit/directives/edit.component.css'],
  template: `
    <form *ngIf="story">

      <story-field [story]="story" textarea="true" name="title" label="Story Title" required>
        <hint>Write a short, Tweetable title like a newspaper headline. Make viewers
          want to click on your piece from the title alone.</hint>
      </story-field>

      <story-field [story]="story" textarea="true" name="shortDescription" label="Teaser" required>
        <hint>A first impression; think of this as the single-item lead of a piece.</hint>
      </story-field>

      <hr/>

      <story-field label="Story Versions" required>
        <audio-uploader [story]="story"></audio-uploader>
      </story-field>

      <hr/>

      <story-field [story]="story" label="Tag your Story" invalid="tags" invalidlabel="" required>
        <hint>Adding tags that are relevant to your piece helps people find your work
          on PRX and can help you be licensed and heard.</hint>
        <div class="span-fields">
          <story-field [story]="story" [select]="GENRES" name="genre" label="Genre"
            small="true" required></story-field>
          <story-field [story]="story" [select]="SUBGENRES" name="subGenre" label="SubGenre"
            small="true" required></story-field>
        </div>
        <story-field [story]="story" textinput="true" name="extraTags"
          label="Extra Tags" small="true"></story-field>
      </story-field>

    </form>
  `
})

export class EditComponent {

  GENRES: string[] = CATEGORIES;

  @Input() story: StoryModel;

  get SUBGENRES(): string[] {
    if (this.story && this.story.genre) {
      return SUBCATEGORIES[this.story.genre];
    } else {
      return [];
    }
  }

}
