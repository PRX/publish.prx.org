import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['basic.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field textinput required [model]="story" name="title" label="Episode Title">
        <div class="fancy-hint">Write a short, Tweetable title. Think newspaper headline.</div>
      </publish-fancy-field>

      <publish-fancy-field textinput required [model]="story" name="shortDescription" label="Teaser" [strict]="strict">
        <div class="fancy-hint">Provide a short description for your episode listing.
        Think of this as a first impression for your listeners.</div>
      </publish-fancy-field>

      <publish-fancy-field label="Description">
        <div class="fancy-hint">
          Write a full description of your episode, including keywords, names of interviewees, places and topics.
          Feel free to incorporate links, images, and any of the other provided rich text formatting options.
        </div>
      <publish-wysiwyg [model]="story" name="description" [content]="story.description" [images]="story.images"
        [changed]="descriptionChanged"></publish-wysiwyg>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field required label="Audio Files">
        <publish-spinner *ngIf="!story?.versions"></publish-spinner>
        <publish-upload *ngFor="let v of story?.versions" [version]="v" [strict]="strict"></publish-upload>
        <h1 *ngIf="story?.versions?.length === 0">
          You have no audio templates for this episode. How did that happen?
        </h1>
      </publish-fancy-field>

      <publish-fancy-field label="Cover Image">
      <div class="fancy-hint">Provide an image for your episode, if desired.</div>
        <publish-image-upload [model]="story" minWidth=1400 minHeight=1400 [strict]="strict"></publish-image-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field textinput [model]="story" name="tags" label="Categories" [strict]="strict">
        <div class="fancy-hint">A comma-separated list of tags relevant to the content of your episode.</div>
      </publish-fancy-field>

      <publish-fancy-field label="Release Date">
        <div class="fancy-hint">If you'd like to manually alter this episode's publication
        to either delay or back-date its release, select the desired release date and time here.
        Otherwise, the episode will be released immediately once published.
        </div>
        <publish-datepicker
          [date]="story.releasedAt" (onDateChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
        </publish-datepicker>
        <publish-timepicker
          [date]="story.releasedAt" (onTimeChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
        </publish-timepicker>
        <p class="form-group">
          <input type="checkbox" [ngModel]="story.releasedAt" [attr.disabled]="story.releasedAt ? null : true" 
            name="useReleasedAt" id="useReleasedAt" (change)="clearReleasedAt()">
          <label for="useReleasedAt">Specify date and time to be published</label>
        </p>
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

  get strict(): boolean {
    return (this.story && this.story.publishedAt) ? true : false;
  }

  clearReleasedAt() {
    if (this.story.releasedAt) {
      this.story.releasedAt = null;
    }
  }

}
