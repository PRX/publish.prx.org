import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';

import { Env } from '../../core/core.env';
import { FeederEpisodeModel, StoryModel } from '../../shared';
import { TabService, HalDoc } from 'ngx-prx-styleguide';

@Component({
  template: `
    <prx-fancy-field label="Download Metrics">
      <div *ngIf="podcastUrl" class="fancy-hint">
        Metrics have moved to their own application -
        <a target="_blank" rel="noopener" [href]="podcastUrl">click here</a>
        to view downloads for your Podcast <em>{{seriesTitle}}</em>.
      </div>
    </prx-fancy-field>
  `,
  styleUrls: ['metrics-downloads.component.css']
})

export class MetricsDownloadsComponent implements OnDestroy {

  tabSub: Subscription;
  seriesId: number;
  seriesTitle: string;
  podcastUrl: string;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.seriesId = s.parent.id;
      this.seriesTitle = s.parent['title'] || '(Unknown series)';
      this.podcastUrl = `${Env.METRICS_HOST}/${this.seriesId}/downloads/podcast/daily`;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
