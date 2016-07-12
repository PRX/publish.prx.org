import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {StoryModel} from '../models/story.model';
import {StoryTabService} from '../services/storytab.service';
import {StoryFieldComponent} from './storyfield.component';
import {ImageUploadComponent} from '../../upload/image-upload.component';

@Component({
  directives: [StoryFieldComponent, ImageUploadComponent],
  selector: 'newstory-decorate',
  styleUrls: [],
  template: `
    <form *ngIf="story">

      <story-field label="Upload a Cover Image">
        <image-uploader [story]="story"></image-uploader>
      </story-field>

      <hr/>

      <story-field [story]="story" textarea="true" name="description" label="Full Description">
        <hint>Adding a written description of your piece full of keywords, names
          of interviewees, places and topics will help people find your piece and
          may improve your chances of being heard and licensed.</hint>
      </story-field>

      <hr/>

      <story-field label="Advanced">
        <hint>These are really advanced fields</hint>
        <h3>Some sort of dropdown for series</h3>
        <h3>And some sort of dropdown for account</h3>
      </story-field>


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
