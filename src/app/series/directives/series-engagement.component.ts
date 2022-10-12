import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabService } from 'ngx-prx-styleguide';
import { SeriesModel, FeederPodcastModel } from '../../shared';

@Component({
  styleUrls: ['series-engagement.component.css'],
  templateUrl: 'series-engagement.component.html'
})
export class SeriesEngagementComponent implements OnInit, OnDestroy {
  loading = true;
  tabSub: Subscription;
  series: SeriesModel;
  podcast: FeederPodcastModel;

  constructor(private tab: TabService) {}

  ngOnInit() {
    this.tabSub = this.tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.loadDistributions();
    });
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  loadDistributions() {
    this.loading = true;

    this.series.loadRelated('distributions').subscribe(() => {
      const distribution = this.series.distributions.find((d) => d.kind === 'podcast');
      if (distribution) {
        distribution.loadRelated('podcast').subscribe(() => {
          this.podcast = distribution.podcast;
          this.loading = false;
        });
      } else {
        this.podcast = null;
        this.loading = false;
      }
    });
  }
}
