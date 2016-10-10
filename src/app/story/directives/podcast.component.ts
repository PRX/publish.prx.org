import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['podcast.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field label="Advanced">
        <div class="fancy-hint">These are really advanced fields</div>
        <h3>Some sort of dropdown for series</h3>
        <h3>And some sort of dropdown for account</h3>
      </publish-fancy-field>

    </form>
  `
})

export class PodcastComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
