import { forkJoin as observableForkJoin, Subscription } from 'rxjs';
import { Component, OnDestroy, ViewChild } from '@angular/core';

import { TabService } from 'ngx-prx-styleguide';
import { CmsService } from '../../core';
import { DistributionModel, FeederEpisodeModel, StoryModel, StoryDistributionModel, WysiwygComponent } from '../../shared';
import { AudioVersionModel } from 'ngx-prx-styleguide';

@Component({
  styleUrls: ['podcast.component.css'],
  templateUrl: 'podcast.component.html'
})
export class PodcastComponent implements OnDestroy {
  explicitOpts = [['Explicit', 'true'], ['Clean', 'false']];
  itunesRequirementsDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc1723472cb';
  episodeTypeOptions = ['full', 'trailer', 'bonus'];

  tabSub: Subscription;
  storyDistribution: StoryDistributionModel;
  story: StoryModel;
  episode: FeederEpisodeModel;
  versions: AudioVersionModel[];
  podcastExplicit: string;
  podcastAuthorName: string;
  podcastAuthorEmail: string;
  @ViewChild('readonlyEditor') wysiwyg: WysiwygComponent;

  constructor(tab: TabService, private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.init(s));
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  init(story: StoryModel) {
    this.story = story;
    this.loadStoryDistribution(story);
    this.loadSeriesDistribution(story);
  }

  loadStoryDistribution(story: StoryModel) {
    story.loadRelated('distributions', true).subscribe(() => {
      this.storyDistribution = story.distributions.find((d) => d.kind === 'episode');
      if (this.storyDistribution) {
        this.storyDistribution.loadRelated('episode').subscribe(() => {
          this.episode = this.storyDistribution.episode;
        });
      }
    });
  }

  loadSeriesDistribution(story: StoryModel) {
    story.getSeriesDistribution('podcast').subscribe((ddoc) => {
      let dist = new DistributionModel(null, ddoc);
      dist.loadRelated('podcast').subscribe(() => {
        if (dist.podcast) {
          this.podcastExplicit = dist.podcast.explicit === 'true' ? 'Explicit' : 'Clean';
        } else {
          this.podcastExplicit = null;
        }
        this.podcastAuthorName = dist.podcast ? dist.podcast.authorName : null;
        this.podcastAuthorEmail = dist.podcast ? dist.podcast.authorEmail : null;
      });
      this.findPodcastAudioVersions(story, dist);
    });
  }

  findPodcastAudioVersions(story: StoryModel, dist: DistributionModel) {
    const loadTpls = dist.loadRelated('versionTemplates');
    const loadVersions = story.loadRelated('versions');
    observableForkJoin(loadTpls, loadVersions).subscribe(() => {
      this.versions = dist.versionTemplates
        .map((vt) => {
          return story.versions.find((v) => v.template && v.template.id === vt.id);
        })
        .filter((v) => v);
    });
  }

  get guidConfirm(): string {
    if (this.episode) {
      let confirmMsg = 'Are you sure you want to change the permanent GUID for this episode';
      if (this.episode.original['guid']) {
        confirmMsg += ` from "${this.episode.original['guid']}"`;
      }
      if (this.episode.guid) {
        confirmMsg += ` to "${this.episode.guid}"? This should only be done in special cases.`;
      } else {
        confirmMsg += '?';
      }
      return confirmMsg;
    }
  }

  toggleAlternateSummary() {
    const content = this.wysiwyg.getContent();
    // if description is empty, assigning empty string to summary is falsey
    //  so the display doesn't swap to editable wysiwyg
    this.episode.set('summary', content ? content : ' ');
  }
}
