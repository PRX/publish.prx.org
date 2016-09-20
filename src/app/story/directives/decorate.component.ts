import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel } from '../../shared';
import { StoryTabService } from '../services/story-tab.service';

@Component({
  selector: 'newstory-decorate',
  styleUrls: [],
  template: `
    <form *ngIf="story">

      <fancy-field label="Upload a Cover Image">
        <image-upload [story]="story"></image-upload>
      </fancy-field>

      <hr/>

      <fancy-field [model]="story" textarea="true" name="description" label="Full Description">
        <fancy-hint>Adding a written description of your piece full of keywords, names
          of interviewees, places and topics will help people find your piece and
          may improve your chances of being heard and licensed.</fancy-hint>
      </fancy-field>

      <hr/>

      <fancy-field label="Advanced">
        <fancy-hint>These are really advanced fields</fancy-hint>
        <h3>Some sort of dropdown for series</h3>
        <h3>And some sort of dropdown for account</h3>
      </fancy-field>

    </form>
  `
})

export class DecorateComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: StoryTabService) {
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
