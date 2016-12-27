import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CmsService } from '../../core';
import { StoryModel, SeriesModel, DistributionModel, TabService } from '../../shared';

@Component({
  styleUrls: ['podcast.component.css'],
  template: `
    <form *ngIf="story">

      <publish-fancy-field label="Explicit" required=1>
        <div class="fancy-hint">
          In accordance with
          <a [href]="itunesRequirementsDoc" 
            title="Requirements - Podcasts Connect Help">the requirements for iTunes podcast content</a>,
          does any of your podcast audio contain 
          <a [href]="itunesExplicitDoc"
            title="About iTunes Store Parental Advisories - Apple Support">explicit material?</a>
        </div>

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
  itunesRequirementsDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc1723472cb';
  itunesExplicitDoc = 'https://support.apple.com/en-us/HT202005';

  OPTIONS = ['', 'Explicit', 'Clean'];

  constructor(tab: TabService,
              private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.init(s));
  }

  init(story) {
    this.story = story;
    this.getSeriesOverrides();
  }

  getSeriesOverrides() {
    this.cms.account.subscribe(account => {
      if (this.story.isNew && this.story.parent && this.story.parent.isa('series')) {
        this.defaultDistributionOverrides(new SeriesModel(account, this.story.parent, false));
      } else if (!this.story.isNew && this.story.doc.has('prx:series')) {
        this.story.doc.follow('prx:series').subscribe(series => this.defaultDistributionOverrides(new SeriesModel(account, series, false)));
      }
    });
  }

  defaultDistributionOverrides(series: SeriesModel) {
    if (series.doc && series.doc.count('prx:distributions')) {
      series.doc.followItems('prx:distributions').subscribe(distributions => {
        let models = distributions.map(d => new DistributionModel(series.doc, d, false));
        this.defaultExplicitToSeries(models.concat(series.unsavedDistribution).filter(d => d));
      });
    } else if (series.unsavedDistribution) {
      this.defaultExplicitToSeries([series.unsavedDistribution]);
    }
  }

  defaultExplicitToSeries(distributions: DistributionModel[]) {
    let dist = distributions.find(d => d.kind === 'podcast');
    if (dist) {
      dist.loadExternal().subscribe(() => {
        // TODO: how to know which of these versions is the podcast?
        this.story.versions.forEach(v => {
          if (dist.podcast && !v.explicit) {
            // TODO: how to know that audio version explicit has not been set?
            // audio version explicit is empty string when it has not been set, which is a valid value
            v.explicit = dist.podcast.explicit;
          }
        });
      });
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
