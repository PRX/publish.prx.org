import { Component, OnInit } from '@angular/core';
import { CmsService, SpinnerComponent, HalDoc, StoryModel, SeriesModel } from '../shared';
import { SearchStoryComponent } from './directives/search-story.component';

@Component({
  directives: [SpinnerComponent, SearchStoryComponent],
  selector: 'search',
  styleUrls: ['search.component.css'],
  templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit {

  isLoaded = false;
  totalCount: number;
  pages: number[];
  noStories: boolean;
  auth: HalDoc;
  stories: StoryModel[];
  storyLoaders: boolean[];

  currentPage: number;
  showNumPages: number = 10;
  pagesBegin: number;
  pagesEnd: number;

  searchTerm: string;
  searchSeriesId: number;
  searchSeries: SeriesModel;
  allSeriesIds: number[];
  allSeries: any;

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.cms.follow('prx:authorization').subscribe((auth) => {
      this.auth = auth;

      this.allSeriesIds = [];
      this.allSeries = {};
      auth.followItems('prx:series').subscribe((series) => {
        for (let s of <HalDoc[]> series) {
          this.allSeriesIds.push(s.id);
          this.allSeries[s.id] = new SeriesModel(auth, s, false);
        }

        this.searchTerm = '';
        this.searchSeries = null;
        this.currentPage = 1;
        this.search(1);
      });
    });
  }

  searchBySeries() {
    this.searchSeries = this.allSeries[this.searchSeriesId];
    this.search(1);
  }

  search(page: number, per: number = 10) {
    this.currentPage = page;
    this.isLoaded = false;

    let parent = this.searchSeries ? this.searchSeries.doc : this.auth;

    let storiesCount = parent.count('prx:stories') || 0;
    if (storiesCount < 1) {
      this.noStories = true;// TODO: this is wrong because draftStory is not yet included
      this.isLoaded = true;
    } else {
      this.storyLoaders = Array(storiesCount);

      let draftStory = new StoryModel(this.auth);
      let isUnsavedDraft = draftStory.isNew && draftStory.isStored();
      let showUnsavedDraft = this.currentPage === 1 && isUnsavedDraft;

      let requestPer = showUnsavedDraft ? per - 1 : per;

      parent.followItems('prx:stories', {page: this.currentPage, per: requestPer}).subscribe((stories) => {
        this.stories = showUnsavedDraft ? [draftStory] : [];
        this.storyLoaders = null;
        let storyDocs = <HalDoc[]> stories;
        for (let doc of storyDocs) {
          let story = new StoryModel(parent, doc, false);
          if (story.doc.has('prx:series')) {
            story.parent = parent;
            this.stories.push(story);
          } else {
            this.stories.push(story);
          }
        }
        this.totalCount = isUnsavedDraft ? storiesCount + 1 : storiesCount;
        let totalPages = this.totalCount % per ? Math.floor(this.totalCount) / per + 1 : Math.floor(this.totalCount / per);
        this.pages = Array.apply(null, {length: totalPages}).map((val, i) => i + 1);
        this.pagesBegin = this.showNumPages * Math.floor((this.currentPage - 1) / this.showNumPages);
        this.pagesEnd = this.showNumPages * Math.ceil(this.currentPage / this.showNumPages);
        this.isLoaded = true;
      });
    }
  }

}
