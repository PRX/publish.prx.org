import { Component, OnInit } from '@angular/core';
import { CmsService, SpinnerComponent, HalDoc, StoryModel, SeriesModel } from '../shared';
import { SearchStoryComponent } from './directives/search-story.component';

@Component({
  directives: [SpinnerComponent, SearchStoryComponent],
  selector: 'publish-search',
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

  searchOrderBy: string;
  orderByOptions: any[] = [
    {
      id: 'TITLE',
      name: 'Story Title'
    },
    {
      id: 'UPDATED',
      name: 'Last Updated'
    },
    {
      id: 'PUBLISHED',
      name: 'When Published'
    }
  ];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.cms.follow('prx:authorization').subscribe((auth) => {
      this.auth = auth;

      this.allSeriesIds = [-1];
      this.allSeries = {};
      auth.followItems('prx:series', {filters: 'v4'}).subscribe((series) => {
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
    this.noStories = false;

    let parent = this.searchSeries ? this.searchSeries.doc : this.auth;

    let draftStory = new StoryModel(this.auth);
    let isUnsavedDraft = draftStory.isNew && draftStory.isStored() && !this.searchSeries;
    let showUnsavedDraft = isUnsavedDraft && this.currentPage === 1 && !this.searchSeries;

    let requestPer = showUnsavedDraft ? per - 1 : per;
    let filters = ['v4'];
    if (+this.searchSeriesId === -1) {
      filters.push('noseries');
    }
    let params = {page: this.currentPage, per: requestPer, filters: filters.join(',')};

    let storiesCount = parent.count('prx:stories') || 0; // wrong, doesn't account for filter
    if (storiesCount > 0) {
      this.storyLoaders = Array(storiesCount);
      parent.followItems('prx:stories', params).subscribe((stories) => {
        this.stories = showUnsavedDraft ? [draftStory] : [];
        this.storyLoaders = null;
        let storyDocs = <HalDoc[]> stories;
        for (let doc of storyDocs) {
          let story = new StoryModel(parent, doc, false);
          if (story.doc.has('prx:series')) {
            // series are embedded, so this should be ok. would prefer to get the series id and use allSeries[id].doc
            story.doc.follow('prx:series').subscribe((series) => {
              story.parent = series;
              this.stories.push(story);
            });
          } else {
            this.stories.push(story);
          }
        }
        this.pagingInfo(per);
        this.isLoaded = true;
      });
    } else {
      if (showUnsavedDraft) {
        this.noStories = false;
        this.stories = [draftStory];
      } else {
        this.noStories = true;
        this.stories = [];
      }
      this.isLoaded = true;
      this.pagingInfo(per);
    }
  }

  pagingInfo(per) {
    this.totalCount = this.stories.length;
    let totalPages = this.totalCount % per ? Math.floor(this.totalCount) / per + 1 : Math.floor(this.totalCount / per);
    this.pages = Array.apply(null, {length: totalPages}).map((val, i) => i + 1);
    this.pagesBegin = this.showNumPages * Math.floor((this.currentPage - 1) / this.showNumPages);
    this.pagesEnd = this.showNumPages * Math.ceil(this.currentPage / this.showNumPages);
  }

}
