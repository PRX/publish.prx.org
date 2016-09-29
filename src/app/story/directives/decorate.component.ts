import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: [],
  template: `
    <form *ngIf="story">

      <publish-fancy-field label="Upload a Cover Image">
        <publish-image-upload [model]="story"></publish-image-upload>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field [model]="story" textarea="true" name="description" label="Full Description">
        <div class="fancy-hint">Adding a written description of your piece full of keywords, names
          of interviewees, places and topics will help people find your piece and
          may improve your chances of being heard and licensed.</div>
      </publish-fancy-field>

      <hr/>

      <publish-fancy-field label="Advanced">
        <div class="fancy-hint">These are really advanced fields</div>
        <h3>Some sort of dropdown for series</h3>
        <h3>And some sort of dropdown for account</h3>
      </publish-fancy-field>

    </form>
  `
})

export class DecorateComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
