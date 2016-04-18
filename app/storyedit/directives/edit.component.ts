import {Component, Input} from 'angular2/core';
import {NgForm} from 'angular2/common';
import {StoryModel} from '../models/story.model';

@Component({
  directives: [NgForm],
  selector: 'newstory-edit',
  styleUrls: ['app/storyedit/storyedit.forms.css'],
  template: `
    <form *ngIf="story && story.isLoaded">

      <div [class]="fieldClasses('title')">
        <h3><label for="title" required>Story Title</label></h3>
        <p class="hint">Write a short, Tweetable title like a newspaper headline.
          Make viewers want to click on your piece from the title alone.</p>
        <textarea id="title" [(ngModel)]="story.title"></textarea>
        <p class="error">Title {{story.invalid.title}}</p>
      </div>

      <div [class]="fieldClasses('shortDescription')">
        <h3><label for="teaser" required>Teaser</label></h3>
        <p class="hint">A first impression; think of this as the single-item
          lead of a piece.</p>
        <textarea id="teaser" [(ngModel)]="story.shortDescription"></textarea>
        <p class="error">Teaser {{story.invalid.shortDescription}}</p>
      </div>

      <hr/>

      <div class="field">
        <h3><label required>Story Versions</label></h3>
        <div class="uploads-box">uploads goes heres</div>
      </div>

      <hr/>

      <div class="field">
        <h3><label required>Tag your Story</label></h3>
        <p class="hint">Adding tags that are relevant to your piece helps people
          find your work on PRX and can help you be licensed and heard.</p>
      </div>

    </form>
  `
})

export class EditComponent {

  @Input() public story: StoryModel;

  fieldClasses(name: string): string {
    let classes = ['field'];
    if (this.story.changed[name]) {
      classes.push('changed');
    }
    if (this.story.invalid[name]) {
      classes.push('invalid');
    }
    return classes.join(' ');
  }

}
