import { Component, OnDestroy, DoCheck, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TabService } from 'ngx-prx-styleguide';
import { SeriesModel, DistributionModel, FeederPodcastModel,
         CATEGORIES, SUBCATEGORIES, WysiwygComponent } from '../../shared';
import * as languageMappingList from 'langmap';

@Component({
  styleUrls: ['series-podcast.component.css'],
  templateUrl: 'series-podcast.component.html'
})

export class SeriesPodcastComponent implements OnDestroy, DoCheck {

  categories = CATEGORIES;
  subCategories: string[] = [];
  explicitOpts = ['Explicit', 'Clean'];
  itunesRequirementsDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc1723472cb';
  itunesExplicitDoc = 'https://support.apple.com/en-us/HT202005';
  itunesCategoryDoc = 'https://help.apple.com/itc/podcasts_connect/#/itc9267a2f12';
  itunesNewFeedURLDoc = 'https://help.apple.com/itc/podcasts_connect/#/itca489031e0';
  podcastTypeOptions = [['Episodic', false], ['Serial', true]];
  audioVersionOptions: string[][];

  tabSub: Subscription;
  state: string;
  series: SeriesModel;
  initialDistributions: DistributionModel[];
  distribution: DistributionModel;
  podcast: FeederPodcastModel;
  languageOptions: string[][];
  @ViewChild('readonlyEditor') wysiwyg: WysiwygComponent;

  constructor(tab: TabService) {
    this.languageOptions = this.getLanguageOptions();
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

  getLanguageOptions(): string[][] {
    let result: string[][] = [];
    for (let key in languageMappingList) {
      if (languageMappingList.hasOwnProperty(key)) {
        let name = `${languageMappingList[key]['englishName']} (${key.toLowerCase()})`;
        let val = key.toLowerCase();
        result.push([name, val]);
      }
    }
    return result;
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
          this.distribution.loadRelated('versionTemplates').subscribe();
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
      podcastDist.set('versionTemplateUrls', [this.audioVersionOptions[0][1]], true);
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

  setNewFeedToPublicFeed(e: Event) {
    if (e.currentTarget && e.currentTarget['checked']) {
      this.podcast.newFeedUrl = this.podcast.publicFeedUrl;
    }
  }

  get publicFeedChangeConfirm(): string {
    if (this.podcast && this.podcast.original['publicFeedUrl']) {
      let confirmMsg = `Are you sure you want to change your public feed URL
                       from "${this.podcast.original['publicFeedUrl']}" to "${this.podcast.publicFeedUrl}"?
                       This will point your subscribers to a new feed location.
                       If you have existing subscribers at ${this.podcast.original['publicFeedUrl']},
                       make sure to set the <a target="_blank" rel="noopener"
                       href="${this.itunesNewFeedURLDoc}">New Feed URL</a>
                       as well to avoid losing subscribers.`;
      return confirmMsg;
    }
  }

  get newFeedUrlConfirm(): string {
    if (this.podcast) {
      let confirmMsg = 'Are you sure you want to change your feed URL';
      if (this.podcast.original['newFeedUrl'] || this.podcast['publicFeedUrl']) {
        confirmMsg += ` from "${this.podcast.original['newFeedUrl'] || this.podcast['publicFeedUrl']}"`;
      }
      if (this.podcast.newFeedUrl) {
        confirmMsg += ` to "${this.podcast.newFeedUrl}"? This will point your subscribers to a new feed location.`;
      } else {
        confirmMsg += '?';
      }
      return confirmMsg;
    }
  }

  get completeConfirm(): string {
    if (this.podcast && this.podcast.complete) {
      let confirmMsg = 'Are you sure this podcast is complete? Apps will assume this show is over, and won\'t look for new episodes.';
      return confirmMsg;
    }
  }

  get versionTemplateConfirm(): string {
    if (this.distribution && this.audioVersionOptions && this.series.hasStories) {
      return `
        Are you sure you want to change the template(s) used for your podcast?
        This could change the audio files used in all published episodes of your podcast.
      `;
    }
  }

  toggleAlternateSummary() {
    let content = this.wysiwyg.getContent();
    // if description is empty, assigning empty string to summary is falsey
    //  so the display doesn't swap to editable wysiwyg
    this.podcast.set('summary', content ? content : ' ');
  }
}
