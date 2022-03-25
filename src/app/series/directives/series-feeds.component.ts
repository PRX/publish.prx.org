import { TabService } from 'ngx-prx-styleguide';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, FeederPodcastModel, FeederFeedModel } from '../../shared';

@Component({
  styleUrls: ['series-feeds.component.css'],
  templateUrl: 'series-feeds.component.html'
})
export class SeriesFeedsComponent implements OnDestroy {
  tabSub: Subscription;
  podcast: FeederPodcastModel;
  loading = true;
  expanded = [];

  feedburnerHelpUrl = 'https://support.google.com/feedburner/answer/78475?hl=en';
  applePodcastHelpUrl = 'https://help.apple.com/itc/podcasts_connect/#/itcb54353390';
  metadataLimitUrl = 'https://help.prx.org/hc/en-us/articles/360055869313-Limiting-Episode-Metadata';

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.load(s));
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  load(series: SeriesModel) {
    this.loading = true;
    series.loadRelated('distributions').subscribe(() => {
      const distribution = series.distributions.find((d) => d.kind === 'podcast');
      if (distribution) {
        distribution.loadRelated('podcast').subscribe(() => {
          this.podcast = distribution.podcast;
          this.podcast.loadRelated('feeds').subscribe(() => {
            this.loading = false;
            this.expanded = this.podcast.feeds.map((_feed, index) => index === 0);
          });
        });
      } else {
        this.loading = false;
      }
    });
  }

  expand(index: number) {
    this.expanded[index] = true;
  }

  collapse(index: number) {
    this.expanded[index] = false;
  }

  addFeed() {
    const feed = new FeederFeedModel(this.podcast.doc);
    this.podcast.feeds.push(feed);
    this.expanded.push(true);
  }

  removeFeed(index: number) {
    this.podcast.feeds[index].isDestroy = true;
  }

  urlConfirm(feed: FeederFeedModel): string {
    if (feed.original['url']) {
      const setYourNewFeed = `
        If you have existing subscribers at <strong>${feed.original['url']}</strong>, make sure to
        set the <a target="_blank" rel="noopener" href="${this.applePodcastHelpUrl}">New Feed URL</a>
        as well to avoid losing subscribers.
        <br/><br/>
      `;
      if (feed.url) {
        return `
          Are you sure you want to change your public feed URL from <strong>${feed.original['url']}</strong>
          to <strong>${feed.url}</strong>? This will point your subscribers to a new feed location.
          <br/><br/>
          ${setYourNewFeed}
        `;
      } else {
        return `
          Are you sure you want to delete your public feed URL? This will point your subscribers back at
          your private feed location <strong>${feed.privateFeedUrl()}</strong>.
          <br/><br/>
          ${setYourNewFeed}
        `;
      }
    }
  }

  newFeedUrlConfirm(feed: FeederFeedModel): string {
    const prevUrl = feed.original['newFeedUrl'] || feed.url;
    if (prevUrl) {
      return `
        Are you sure you want to change your feed URL from <strong>${prevUrl}</strong> to
        <strong>${feed.newFeedUrl}</strong>? This will point your subscribers to a new feed location.
      `;
    } else {
      return `
        Are you sure you want to change your feed URL to <strong>${feed.newFeedUrl}</strong>?
        This will point your subscribers to a new feed location.
      `;
    }
  }
}
