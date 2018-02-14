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
      <div class="fancy-hint">
        Metrics have moved to their own app - use the below links to access them:
      </div>

      <p *ngIf="error">
        There was an error retrieving your podcast information - please check
        the podcast configuration for your episode/series.
      </p>

      <ul *ngIf="!error">
        <li *ngIf="podcastUrl">Podcast downloads for
          <a target="_blank" rel="noopener" [href]="podcastUrl">{{seriesTitle}}</a>
        </li>
        <li *ngIf="episodeUrl">Episode downloads for
          <a target="_blank" rel="noopener" [href]="episodeUrl">{{story.title}}</a>
        </li>
      </ul>
    </prx-fancy-field>
  `,
  styleUrls: ['metrics-downloads.component.css']
})

export class MetricsDownloadsComponent implements OnDestroy {

  tabSub: Subscription;
  story: StoryModel;
  seriesId: number;
  seriesTitle: string;
  podcastUrl: string;
  episodeUrl: string;
  error: boolean;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      this.seriesId = s.parent.id;
      this.seriesTitle = s.parent['title'] || '(Unknown series)';
      this.podcastUrl = `${Env.METRICS_HOST}/${this.seriesId}/downloads/podcast/daily`;
      this.loadEpisodeGuid().subscribe(guid => {
        if (guid) {
          this.episodeUrl = `${Env.METRICS_HOST}/${this.seriesId}/downloads/episodes/daily`;
        } else {
          this.error = true;
        }
      });
    });
  }

  loadEpisodeGuid(): Observable<string> {
    return this.story.loadRelated('distributions', true).map(() => {
      let storyDistribution = this.story.distributions.find(d => d.kind === 'episode');
      if (storyDistribution) {
        return this.parseDist(storyDistribution.doc);
      } else {
        return null;
      }
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  private parseDist(doc: HalDoc): string {
    if (doc && doc['url'] && doc['url'].match(/feeder/)) {
      return doc['url'].split('/').pop();
    } else {
      return null;
    }
  }

}
