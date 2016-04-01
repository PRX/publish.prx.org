import {Component, Input} from 'angular2/core';
import {NgForm} from 'angular2/common';
import {StoryModel} from '../models/story.model';

@Component({
  directives: [NgForm],
  selector: 'newstory-edit',
  styleUrls: ['app/storyedit/storyedit.forms.css'],
  template: `
    <form *ngIf="story && story.isLoaded">

      <fieldset>
        <legend hidden>Basic Info</legend>

        <label for="title" required>Story Title</label>
        <p>
          Write a short, Tweetable title like a newspaper headline.
          Make viewers want to click on your piece from the title alone.
        </p>
        <textarea id="title" required [(ngModel)]="story.title" #title="ngForm"></textarea>
        <p *ngIf="!title.valid" class="error">Title is required</p>

        <label for="teaser" required>Teaser</label>
        <p>A first impression; think of this as the single-item lead of a piece.</p>
        <textarea id="teaser" required [(ngModel)]="story.shortDescription"></textarea>

        <hr/>

        <label required>Story Versions</label>
        <div class="uploads-box">
        </div>

        <hr/>

        <label required>Tag your Story</label>
        <p>
          Adding tags that are relevant to your piece helps people find your
          work on PRX and can help you be licensed and heard.
        </p>

      </fieldset>

      <br/><br/>
      <br/><br/>
    </form>
  `
})

export class EditComponent {

  @Input() public story: StoryModel;

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.story); }

}
