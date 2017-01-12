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
  templateUrl: 'podcast.component.html'
})

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
      let dist = new DistributionModel(null, ddoc);
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
    if (version.isNew && !version.changed('explicit')) {
      dist.loadRelated('podcast').subscribe(() => {
        if (dist.podcast && dist.podcast.explicit) {
          version.set('explicit', dist.podcast.explicit, true);
        }
      });
    }
  }

}
