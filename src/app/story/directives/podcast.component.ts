import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
  styleUrls: ['podcast.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field label="Explicit" required=1>
        <div class="fancy-hint">Does any of your podcast audio contain explicit material?</div>

        <div *ngFor="let v of story.versions" class="version">
          <header>
            <strong>{{v.label}}</strong>
          </header>
          <section>
            <publish-fancy-field [model]="v" [select]="OPTIONS" name="explicit">
            </publish-fancy-field>
          </section>
        </div>
      </publish-fancy-field>

    </form>
  `
})

export class PodcastComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  OPTIONS = ['Explicit', 'Clean'];

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
