import { Component, OnDestroy, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, DistributionModel, FeederPodcastModel,
         TabService, CATEGORIES, SUBCATEGORIES } from '../../shared';

@Component({
  styleUrls: ['series-podcast.component.css'],
  templateUrl: 'series-podcast.component.html'
})

export class SeriesPodcastComponent implements OnDestroy, DoCheck {

  categories = [''].concat(CATEGORIES);
  subCategories: string[] = [];
  explicitOpts = ['', 'Explicit', 'Clean'];
  itunesRequirementsDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc1723472cb';
  itunesExplicitDoc = 'https://support.apple.com/en-us/HT202005';
  itunesCategoryDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc9267a2f12';
  audioVersionOptions: string[][];

  tabSub: Subscription;
  state: string;
  series: SeriesModel;
  initialDistributions: DistributionModel[];
  distribution: DistributionModel;
  podcast: FeederPodcastModel;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.series.loadRelated('versionTemplates').subscribe(() => {
        let realTemplates = this.series.versionTemplates.filter(t => t.doc);
        this.audioVersionOptions = realTemplates.map(tpl => {
          return [tpl.label || '[Untitled]', tpl.doc.expand('self')];
        });
      });
      this.loadDistributions();
    });
  }

  ngDoCheck() {
    this.loadDistributions();
    if (this.distribution) {
      this.state = 'editing';
    } else if (this.series && this.series.isNew) {
      this.state = 'new';
    } else if (this.series) {
      this.state = 'creating';
      if (this.audioVersionOptions && !this.audioVersionOptions.length) {
        this.state = 'missing';
      }
    } else {
      this.state = null;
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  loadDistributions() {
    let initial = this.initialDistributions;
    if (this.series && (!initial || this.series.distributions !== initial)) {
      this.initialDistributions = this.series.distributions;
      this.series.loadRelated('distributions').subscribe(() => {
        this.distribution = this.series.distributions.find(d => d.kind === 'podcast');
        if (this.distribution) {
          this.distribution.loadRelated('podcast').subscribe(() => {
            this.podcast = this.distribution.podcast;
            this.setSubCategories();
          });
        } else {
          this.podcast = null;
          this.setSubCategories();
        }
      });
    }
  }

  createDistribution() {
    let podcastDist = new DistributionModel(this.series.doc);
    podcastDist.set('kind', 'podcast');
    this.series.distributions.push(podcastDist);
    this.distribution = podcastDist;
    podcastDist.loadRelated('podcast').subscribe(() => {
      this.podcast = podcastDist.podcast;
    });
    this.series.loadRelated('versionTemplates').subscribe(() => {
      if (this.audioVersionOptions.length === 1) {
        podcastDist.set('versionTemplateUrl', this.audioVersionOptions[0][1], true);
      }
    });
  }

  setSubCategories() {
    if (this.podcast && this.podcast.category) {
      if (SUBCATEGORIES[this.podcast.category]) {
        this.subCategories = [''].concat(SUBCATEGORIES[this.podcast.category]);
      } else {
        this.subCategories = [];
      }
    } else {
      this.subCategories = [];
    }
    if (this.podcast && this.subCategories.indexOf(this.podcast.subCategory) < 0) {
      this.podcast.set('subCategory', '');
    }
  }

  get newFeedUrlConfirm(): string {
    if (this.podcast) {
      let prompt = 'Are you sure you want to change your feed URL';
      if (this.podcast.original['newFeedUrl'] || this.podcast['publicFeedUrl']) {
        prompt += ` from "${this.podcast.original['newFeedUrl'] || this.podcast['publicFeedUrl']}"`;
      }
      if (this.podcast.newFeedUrl) {
        prompt += ` to "${this.podcast.newFeedUrl}"? This will point your subscribers to a new feed location.`;
      } else {
        prompt += '?';
      }
      return prompt;
    }
  }

  get versionTemplateConfirm(): string {
    if (this.distribution && this.audioVersionOptions) {
      let url = this.distribution.versionTemplateUrl;
      let match = this.audioVersionOptions.find(opt => opt[1] === url);
      let name = match ? match[0] : ''; // options are [[display, value]]
      return `
        Are you sure you want to use <b>${name}</b> as the audio for your podcast?
        Changing this field can have catastrophic consequences for any previously
        published episodes.
      `;
    }
  }

}
