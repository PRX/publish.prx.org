import { TabService } from 'ngx-prx-styleguide';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { TabService, SimpleDate, HalDoc } from 'ngx-prx-styleguide';
import { SeriesModel, FeederPodcastModel, FeederFeedModel } from '../../shared';

@Component({
  styleUrls: ['series-feeds.component.css'],
  templateUrl: 'series-feeds.component.html'
})
export class SeriesFeedsComponent implements OnDestroy {
  tabSub: Subscription;
  podcast: FeederPodcastModel;
  loading = true;
  expanded = [];

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.load(s));
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  load(series: SeriesModel) {
    this.loading = true;
    series.loadRelated('distributions').subscribe(() => {
      const distribution = series.distributions.find((d) => d.kind === 'podcast');
      if (distribution) {
        distribution.loadRelated('podcast').subscribe(() => {
          this.podcast = distribution.podcast;
          this.podcast.loadRelated('feeds').subscribe(() => {
            this.loading = false;
            this.expanded = this.podcast.feeds.map((feed, index) => index === 0);
          });
        });
      } else {
        this.loading = false;
      }
    });
  }

  expand(index: number) {
    this.expanded[index] = true;
  }

  collapse(index: number) {
    this.expanded[index] = false;
  }

  addFeed() {
    const feed = new FeederFeedModel(this.podcast.doc);
    this.podcast.feeds.push(feed);
    this.expanded.push(true);
  }
}
