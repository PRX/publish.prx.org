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
      }
    });
  }

  defaultDistributionOverrides(series: SeriesModel) {
    series.loadRelated('distributions').subscribe(distributions => {
      this.defaultExplicitToSeries(<DistributionModel[]>distributions);
    });
  }

  defaultExplicitToSeries(distributions: DistributionModel[]) {
    let dist = distributions.find(d => d.kind === 'podcast');
    dist.loadRelated('versionTemplate').subscribe(() => {
      dist.loadExternal().subscribe(() => {
        this.story.loadRelated('versions').subscribe(() => {
          this.story.versions.forEach(v => {
            // well crap, new story's version doc is null
            if (v.doc && v.doc.has('prx:audio-version-template')) {
              v.doc.follow('prx:audio-version-template').subscribe(vTemplate => {
                if (dist.podcast && !v.changed('explicit') && dist.versionTemplate.doc.id === vTemplate.id) {
                  v.explicit = dist.podcast.explicit;
                }
              });
            }
          });
        });
      });
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
