import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService, HalDoc } from '../core';
import { StoryModel, SeriesModel } from '../shared';
import { SearchStory } from './search-story.model';
import { SearchSeries } from './search-series.model';

@Component({
  selector: 'publish-search',
  styleUrls: ['search.component.css'],
  templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit {

  static TAB_STORIES = 'stories';
  static TAB_SERIES = 'series';
  selectedTab: string;

  isLoaded = false;
  totalCount: number;
  pages: number[];
  noResults: boolean;
  auth: HalDoc;
  storiesResults: StoryModel[] = [];
  seriesResults: SeriesModel[] = [];

  currentPage: number;
  showNumPages = 10;
  pagesBegin: number;
  pagesEnd: number;

  searchStoryParams: SearchStory = new SearchStory();
  searchSeriesParams: SearchSeries = new SearchSeries();

  allSeriesIds: number[];
  allSeries: any;

  orderByOptionsStories = SearchStory.ORDERBY_OPTIONS;
  orderByOptionsSeries = SearchSeries.ORDERBY_OPTIONS;

  constructor(private cms: CmsService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.cms.auth.subscribe((auth) => {
      this.auth = auth;

      this.allSeriesIds = [-1];
      this.allSeries = {};
      this.auth.followItems('prx:series', {filters: 'v4'}).subscribe((series) => {
        for (let s of series) {
          this.allSeriesIds.push(s.id);
          this.allSeries[s.id] = new SeriesModel(this.auth, s, false);
        }
        this.subscribeRouteParams();
      });
    });
  }

  subscribeRouteParams() {
    this.route.params.forEach((params) => {
      this.clearResults();
      this.selectedTab = params['tab'] || SearchComponent.TAB_STORIES;
      this.currentPage = params['page'] ? +params['page'] : 1;
      if (this.selectedTab === SearchComponent.TAB_STORIES) {
        this.searchStoryParams.fromRouteParams(params);
        this.searchStories();
      } else if (this.selectedTab === SearchComponent.TAB_SERIES) {
        this.searchSeriesParams.fromRouteParams(params);
        this.searchSeries();
      }
    });
  }

  searchWithParams(searchParams: any) {
    let routeParams = {tab: this.selectedTab};
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== undefined && searchParams[key] !== 'undefined') {
        routeParams[key] = searchParams[key];
      }
    });
    this.router.navigate(['search', routeParams]);
  }

  navigateToPagePer(page: number, perPage: number = undefined) {
    if (this.selectedTab === SearchComponent.TAB_STORIES) {
      this.searchWithParams(Object.assign({}, this.searchStoryParams, {tab: this.selectedTab, page, perPage}));
    } else if (this.selectedTab === SearchComponent.TAB_SERIES) {
      this.searchWithParams(Object.assign({}, this.searchSeriesParams, {tab: this.selectedTab, page, perPage}));
    }
  }

  searchStories() {
    this.isLoaded = false;
    this.noResults = false;

    let parent = this.auth;
    if (this.searchStoryParams.seriesId && this.searchStoryParams.seriesId !== -1) {
      parent = this.allSeries[this.searchStoryParams.seriesId].doc;
    }

    let filters = ['v4'];
    if (this.searchStoryParams.seriesId === -1) {
      filters.push('noseries');
    }
    if (this.searchStoryParams.text)  {
      filters.push('text=' + this.searchStoryParams.text);
    }
    let sorts;
    if (this.searchStoryParams.orderBy) {
      sorts = this.searchStoryParams.orderBy + ':';
      sorts += this.searchStoryParams.orderDesc ? 'desc' : 'asc';
      if (this.searchStoryParams.orderBy === 'published_at') {
        sorts += ', updated_at:';
        sorts += this.searchStoryParams.orderDesc ? 'desc' : 'asc';
      }
    }
    let params = {page: this.currentPage, per: this.searchStoryParams.perPage, filters: filters.join(','), sorts};

    if (parent.count('prx:stories')) {
      parent.followItems('prx:stories', params).subscribe((stories) => {
        this.storiesResults = [];
        let storiesById = {};
        let storyIds = stories.map((doc) => {
          storiesById[doc.id] = new StoryModel(parent, doc, false);
          if (doc.has('prx:series')) {
            doc.follow('prx:series').subscribe((series) => {
              storiesById[doc.id].parent = series;
            });
          }
          return doc.id;
        });
        if (stories.length === 0) {
          this.noResults = true;
          this.totalCount = 0;
        } else {
          this.totalCount = stories[0].total();
          this.storiesResults = storyIds.map(storyId => storiesById[storyId]);
        }
        this.pagingInfo(this.searchStoryParams.perPage);
        this.isLoaded = true;
      });
    } else {
      this.noResults = true;
      this.isLoaded = true;
      this.totalCount = 0;
    }
  }

  searchSeries() {
    this.isLoaded = false;
    this.noResults = false;

    let filters = ['v4'];
    if (this.searchSeriesParams.text)  {
      filters.push('text=' + this.searchSeriesParams.text);
    }
    let sorts;
    if (this.searchSeriesParams.orderBy) {
      sorts = this.searchSeriesParams.orderBy + ':';
      sorts += this.searchSeriesParams.orderDesc ? 'desc' : 'asc';
    }
    let params = {page: this.currentPage, per: this.searchSeriesParams.perPage, filters: filters.join(','), sorts};
    if (this.auth.count('prx:series')) {
      this.auth.followItems('prx:series', params).subscribe((seriesResults) => {
        this.seriesResults = [];
        let seriesDocs = seriesResults;
        for (let doc of seriesDocs) {
          this.seriesResults.push(new SeriesModel(this.auth, doc, false));
        }
        if (seriesDocs.length === 0) {
          this.noResults = true;
          this.totalCount = 0;
        } else {
          this.totalCount = seriesDocs[0].total();
        }
        this.pagingInfo(this.searchSeriesParams.perPage);
        this.isLoaded = true;
      });
    } else {
      this.noResults = true;
      this.isLoaded = true;
      this.totalCount = 0;
    }
  }

  pagingInfo(per) {
    let totalPages = this.totalCount % per ? Math.floor(this.totalCount) / per + 1 : Math.floor(this.totalCount / per);
    this.pages = Array.apply(null, {length: totalPages}).map((val, i) => i + 1);
    this.pagesBegin = this.showNumPages * Math.floor((this.currentPage - 1) / this.showNumPages);
    this.pagesEnd = this.showNumPages * Math.ceil(this.currentPage / this.showNumPages);
  }

  searchStoriesTab() {
    this.clearResults();
    this.router.navigate(['search', { tab: SearchComponent.TAB_STORIES}]);
  }

  searchSeriesTab() {
    this.clearResults();
    this.router.navigate(['search', { tab: SearchComponent.TAB_SERIES}]);
  }

  clearResults() {
    this.storiesResults.length = 0;
    this.seriesResults.length = 0;
    this.totalCount = 0;
  }

  isOnSeriesTab() {
    return this.selectedTab === SearchComponent.TAB_SERIES;
  }

  isOnStoriesTab() {
    return this.selectedTab === SearchComponent.TAB_STORIES;
  }
}
