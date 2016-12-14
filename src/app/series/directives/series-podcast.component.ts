import { Component, OnDestroy, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, DistributionModel, FeederPodcastModel,
  TabService, CATEGORIES, SUBCATEGORIES } from '../../shared';

@Component({
  styleUrls: ['series-podcast.component.css'],
  template: `
    <form [ngSwitch]="state">

      <publish-fancy-field label="Series Podcast" *ngSwitchCase="'new'">
        <div class="fancy-hint">You must save your series before you can create
          a podcast distribution for it.</div>
      </publish-fancy-field>

      <publish-fancy-field label="Series Podcast" *ngSwitchCase="'creating'">
        <div class="fancy-hint">No podcast has been configured for this series.</div>
        <button (click)="createDistribution()">Create Podcast</button>
      </publish-fancy-field>

      <div *ngSwitchCase="'editing'">

        <publish-fancy-field label="iTunes Categories">
          <div class="fancy-hint">Some description of what these are here and
            maybe also a link to the itunes docs.</div>
          <div class="span-fields">
            <publish-fancy-field label="Category" [model]="podcast" name="category"
              [select]="categories" (change)="setSubCategories()" small=1>
            </publish-fancy-field>
            <publish-fancy-field *ngIf="!subCategories.length" label="Sub-Category"
              [select]="[]" small=1>
            </publish-fancy-field>
            <publish-fancy-field *ngIf="subCategories.length" label="Sub-Category"
              [model]="podcast" name="subCategory" [select]="subCategories" small=1>
            </publish-fancy-field>
          </div>
        </publish-fancy-field>

      </div>

    </form>
  `
})

// <publish-fancy-field [model]="story" label="Tag your Story" invalid="tags" invalidlabel="" required>
//   <div class="fancy-hint">Adding tags that are relevant to your piece helps people find your work
//     on PRX and can help you be licensed and heard.</div>
//   <div class="span-fields">
//     <publish-fancy-field [model]="story" [select]="GENRES" name="genre" label="Genre"
//       small="true" required></publish-fancy-field>
//     <publish-fancy-field [model]="story" [select]="SUBGENRES" name="subGenre" label="SubGenre"
//       small="true" required></publish-fancy-field>
//   </div>
//   <publish-fancy-field [model]="story" textinput="true" name="extraTags"
//     label="Extra Tags" small="true"></publish-fancy-field>

export class SeriesPodcastComponent implements OnDestroy, DoCheck {

  categories = [''].concat(CATEGORIES);
  subCategories: string[] = [];

  tabSub: Subscription;
  state: string;
  series: SeriesModel;
  distribution: DistributionModel;
  podcast: FeederPodcastModel;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe(s => this.series = <SeriesModel> s);
  }

  ngDoCheck() {
    if (this.series && this.series.distributions) {
      let dist = this.series.distributions.find(d => d.kind === 'podcast');
      if (this.distribution !== dist) {
        this.distribution = dist;
        this.loadPodcast();
      }
    }
    if (this.distribution) {
      this.state = 'editing';
    } else if (this.series && this.series.isNew) {
      this.state = 'new';
    } else if (this.series) {
      this.state = 'creating';
    } else {
      this.state = null;
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  loadPodcast() {
    this.podcast = null;
    if (this.distribution) {
      this.distribution.loadExternal().subscribe(() => {
        this.podcast = this.distribution.podcast;
        this.setSubCategories();
      });
    }
  }

  createDistribution() {
    let podcast = new DistributionModel(this.series.doc);
    podcast.set('kind', 'podcast');
    this.series.distributions.push(podcast);
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

}
