import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['basic.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field [model]="story" textinput="true" name="title" label="Story Title" required>
        <div class="fancy-hint">Write a short, Tweetable title like a newspaper headline.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textinput="true" name="shortDescription" label="Teaser" required>
        <div class="fancy-hint">A first impression; think of this as the single-item lead of a piece.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="story" textarea="true" name="description" label="Description">
        <div class="fancy-hint">A full description of your piece including keywords, names
          of interviewees, places and topics.</div>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field label="Audio Files" required>
        <publish-audio-upload [story]="story"></publish-audio-upload>
      </publish-fancy-field>

      <publish-fancy-field label="Cover Image">
        <publish-image-upload [model]="story" minWidth=1400 minHeight=1400></publish-image-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field [model]="story" textinput="true" name="tags">
        <div class="fancy-hint">A comma-separated list of tags relevant to your story.</div>
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
