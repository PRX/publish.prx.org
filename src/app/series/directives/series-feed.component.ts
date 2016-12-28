import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DistributionModel, SeriesModel, StoryModel, TabService } from '../../shared';

@Component({
  template: `
    <form *ngIf="series && podcast">
      <h3>Published Feed</h3>
      <h4 class="hint">Here are your published stories as they appear in your podcast feed.</h4>
      <ul>
        <li *ngFor="let s of stories">
          <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
          <p class="hint">Published {{s.pubDate}}.</p>
        </li>
      </ul>
    </form>
  `,
  styleUrls: ['./series-basic.component.css']
})

export class SeriesFeedComponent implements OnDestroy {

  series: SeriesModel;
  stories: StoryModel[];
  podcast: DistributionModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
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
            })
        });
  }


  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
