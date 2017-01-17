import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['basic.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field [model]="story" textinput="true" name="title" label="Story Title"
      tiptext="Think newspaper headline." required>
        <div class="fancy-hint">Write a short, Tweetable title.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textinput="true" name="shortDescription" label="Teaser"
      tiptext="Think of this as a first impression for your piece." required>
        <div class="fancy-hint">Provide a short description for your piece listing.</div>
      </publish-fancy-field>

      <h3>
        <section [publishHoverTip]="'Include keywords, names of interviewees, places and topics'">
          <p></p>
        </section>
        <label for="description">Description</label>
      </h3>
      <p class="hint">A full description of your piece.</p>
      <publish-wysiwyg [model]="story" name="description" [content]="story.description" [images]="story.images"
        [changed]="descriptionChanged"></publish-wysiwyg>

      <hr/>

      <publish-fancy-field label="Audio Files" required>
        <publish-spinner *ngIf="!story?.versions"></publish-spinner>
        <publish-upload *ngFor="let v of story?.versions" [version]="v"></publish-upload>
        <h1 *ngIf="story?.versions?.length === 0">
          You have no audio versions for this story. How did that happen?
        </h1>
      </publish-fancy-field>

      <publish-fancy-field label="Cover Image">
      <div class="fancy-hint">Provide an image for your piece, if desired.</div>
        <publish-image-upload [model]="story" minWidth=1400 minHeight=1400></publish-image-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field [model]="story" textinput="true" name="tags" label="Categories"
      tiptext="More is better!" >
        <div class="fancy-hint">A comma-separated list of tags relevant to the content of your piece.</div>
      </publish-fancy-field>

      <publish-fancy-field label="Release Date">
        <div class="fancy-hint">If you'd like to manually alter this story's publication
        to either delay or back-date its release, select the desired release date here.
        Otherwise, the story will be released immediately once published.</div>
        <publish-datepicker
          [date]="story.releasedAt" (onDateChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
        </publish-datepicker>
        <publish-timepicker
          [date]="story.releasedAt" (onTimeChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
        </publish-timepicker>
      </publish-fancy-field>

    </form>
  `
})

export class BasicComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  get descriptionChanged(): boolean {
    return this.story && this.story.changed('description', false);
  }

  get releasedAtChanged(): boolean {
    return this.story && this.story.changed('releasedAt', false);
  }
}
