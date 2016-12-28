import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DistributionModel, SeriesModel, StoryModel, TabService } from '../../shared';

@Component({
  template: `
    <section *ngIf="series && podcast">
      <h3>Published Feed</h3>

      <div class="hint" *ngIf="noStories">
        You have no published stories in this podcast.
      </div>

      <section *ngIf="!noStories">
        <h4>Here are your published stories as they appear in your podcast feed.</h4>
        <ul>
          <li *ngFor="let s of stories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="hint">Published {{s.pubDate}}.</p>
          </li>
        </ul>
      </section>
    </section>
  `,
  styleUrls: ['./series-basic.component.css']
})

export class SeriesFeedComponent implements OnDestroy {

  noStories: boolean;
  series: SeriesModel;
  stories: StoryModel[];
  podcast: DistributionModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.noStories = false;
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.podcast = s.distributions.filter(dist => dist.kind === 'podcast')[0];
      this.setStories();
    });
  }

  setStories() {
    this.podcast
        .parent
        .followItems('prx:stories', { sorts: 'updated_at:desc' })
        .subscribe((docs) => {
          this.stories = docs
            .filter(doc => doc['publishedAt'])
            .map((doc) => {
              let story = new StoryModel(this.podcast.parent, doc, false);
              story['pubDate'] = story.publishedAt.toLocaleDateString();
              return story;
            });
          if (this.stories.length === 0) {
            this.noStories = true;
          }
        });
  }


  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
