import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CmsService } from '../../core';
import {
  AudioVersionModel,
  DistributionModel,
  FeederEpisodeModel,
  FeederPodcastModel,
  StoryModel,
  StoryDistributionModel,
  TabService
} from '../../shared';

@Component({
  styleUrls: ['podcast.component.css'],
  template: `
    <form *ngIf="episode">

      <publish-fancy-field label="Episode GUID" required textinput [model]="episode" name="guid">
        <div class="fancy-hint">The original GUID of this episode.</div>
      </publish-fancy-field>

      <publish-fancy-field label="Author Information">
        <div class="fancy-hint">Set the author name and email to be associated with this episode.</div>
        <div class="span-fields">
          <publish-fancy-field label="Name" textinput [model]="episode" name="authorName" small=1>
          </publish-fancy-field>
          <publish-fancy-field label="Email" textinput [model]="episode" name="authorEmail" small=1>
          </publish-fancy-field>
        </div>
      </publish-fancy-field>

      <publish-fancy-field *ngIf="version" label="Explicit" required=1>
        <div class="fancy-hint">
          In accordance with
          <a [href]="itunesRequirementsDoc"
            title="Requirements - Podcasts Connect Help">the requirements for iTunes podcast content</a>,
          does any of your podcast audio contain
          <a [href]="itunesExplicitDoc"
            title="About iTunes Store Parental Advisories - Apple Support">explicit material?</a>
        </div>
        <div class="version">
          <header>
            <strong>{{version?.label}}</strong>
          </header>
          <section>
            <publish-fancy-field [model]="version" [select]="explicitOpts" name="explicit">
            </publish-fancy-field>
          </section>
        </div>
      </publish-fancy-field>

    </form>
  `
})

//

export class PodcastComponent implements OnDestroy {

  explicitOpts = ['', 'Explicit', 'Clean'];
  itunesRequirementsDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc1723472cb';
  itunesExplicitDoc = 'https://support.apple.com/en-us/HT202005';

  tabSub: Subscription;
  storyDistribution: StoryDistributionModel;
  seriesDistribution: DistributionModel;
  podcast: FeederPodcastModel;
  episode: FeederEpisodeModel;
  version: AudioVersionModel;

  constructor(tab: TabService, private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.init(s));
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  init(story: StoryModel) {
    this.loadStoryDistribution(story);
    this.loadSeriesDistribution(story);
  }

  loadStoryDistribution(story: StoryModel) {
    story.loadRelated('distributions', true).subscribe(() => {
      this.storyDistribution = story.distributions.find(d => d.kind === 'episode');
      if (this.storyDistribution) {
        this.storyDistribution.loadRelated('episode').subscribe(() => {
          this.episode = this.storyDistribution.episode;
        });
      }
    });
  }

  loadSeriesDistribution(story: StoryModel) {
    story.getSeriesDistribution('podcast').subscribe(ddoc => {
      let dist = new DistributionModel({distribution: ddoc});
      this.findPodcastAudioVersion(story, dist);
    });
  }

  findPodcastAudioVersion(story: StoryModel, dist: DistributionModel) {
    dist.loadRelated('versionTemplate').subscribe(() => {
      if (dist.versionTemplate) {
        story.loadRelated('versions').subscribe(() => {
          this.version = story.versions.find(v => v.template && v.template.id === dist.versionTemplate.id);
          this.setDefaultExplicit(this.version, dist);
        });
      } else {
        this.version = null;
      }
    });
  }

  setDefaultExplicit(version: AudioVersionModel, dist: DistributionModel) {
    if (version.isNew) {
      dist.loadRelated('podcast').subscribe(() => {
        if (dist.podcast && dist.podcast.explicit) {
          version.set('explicit', dist.podcast.explicit, true);
        }
      });
    }
  }

}
