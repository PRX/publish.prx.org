import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['basic.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field [model]="story" textinput="true" name="title" label="Story Title" tiptext="Tooltip tbd" required>
        <div class="fancy-hint">Write a short, Tweetable title like a newspaper headline.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textinput="true" name="shortDescription" label="Teaser" tiptext="Tooltip tbd" required>
        <div class="fancy-hint">Provide a short description for your piece listing.
        Think of this as a first impression for your piece.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textarea="true" name="description" label="Description" tiptext="Tooltip tbd" required>
        <div class="fancy-hint">Provide a full description of your piece
        including keywords, names of interviewees, places and topics.</div>
      </publish-fancy-field>

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
        <publish-image-upload [model]="story" minWidth=1400 minHeight=1400 ></publish-image-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field [model]="story" textinput="true" name="tags" label="Categories" tiptext="Tooltip tbd" >
        <div class="fancy-hint">A comma-separated list of tags relevant to the content of your piece.</div>
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

}
