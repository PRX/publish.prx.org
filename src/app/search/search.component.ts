import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService, HalDoc } from '../core';
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
  searchError: boolean;
  auth: HalDoc;
  storiesResults: HalDoc[] = [];
  seriesResults: HalDoc[] = [];

  currentPage: number;
  showNumPages = 10;
  pagesBegin: number;
  pagesEnd: number;

  searchStoryParams: SearchStory = new SearchStory();
  searchSeriesParams: SearchSeries = new SearchSeries();

  allSeriesIds: number[];
  allSeries: {[id: number]: HalDoc};

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
      this.auth.followItems('prx:series', {filters: 'v4', zoom: false, per: 999}).subscribe((series) => {
        this.allSeriesIds = [-1].concat(series.map(doc => doc.id));
        this.allSeries = series.reduce((map, doc) => { map[doc.id] = doc; return map; }, {});
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
    this.searchError = false;

    let parent = this.auth;
    if (this.searchStoryParams.seriesId && this.searchStoryParams.seriesId !== -1) {
      parent = this.allSeries[this.searchStoryParams.seriesId];
    }

    let params = {
      page: this.currentPage,
      per: this.searchStoryParams.perPage,
      filters: ['v4'],
      zoom: ['prx:image', 'prx:series'],
      q: undefined,
      sorts: undefined,
    };
    if (this.searchStoryParams.seriesId === -1) {
      params.filters.push('noseries');
    }
    if (this.searchStoryParams.text)  {
      params.q = this.addWildcard(this.searchStoryParams.text);
    }
    if (this.searchStoryParams.orderBy) {
      const fld = this.searchStoryParams.orderBy;
      const dir = this.searchStoryParams.orderDesc ? 'desc' : 'asc';
      params.sorts = [`${fld}:${dir}`];
      if (fld === 'published_at') {
        params.sorts.push(`updated_at:${dir}`);
      }
    }

    if (parent.count('prx:stories-search')) {
      parent.followItems('prx:stories-search', params).subscribe(
        stories => {
          this.storiesResults = stories;
          if (stories.length === 0) {
            this.noResults = true;
            this.totalCount = 0;
          } else {
            this.totalCount = stories[0].total();
          }
          this.pagingInfo(this.searchStoryParams.perPage);
          this.isLoaded = true;
        },
        err => {
          this.searchError = true;
          this.isLoaded = true;
          this.noResults = false;
          this.clearResults();
        }
      );
    } else {
      this.noResults = true;
      this.isLoaded = true;
      this.totalCount = 0;
    }
  }

  searchSeries() {
    this.isLoaded = false;
    this.noResults = false;

    let params = {
      page: this.currentPage,
      per: this.searchSeriesParams.perPage,
      filters: ['v4'],
      zoom: ['prx:image'],
      q: undefined,
      sorts: undefined,
    };
    if (this.searchSeriesParams.text)  {
      params.q = this.addWildcard(this.searchSeriesParams.text);
    }
    if (this.searchSeriesParams.orderBy) {
      const fld = this.searchSeriesParams.orderBy;
      const dir = this.searchSeriesParams.orderDesc ? 'desc' : 'asc';
      params.sorts = [`${fld}:${dir}`];
    }

    if (this.auth.count('prx:series-search')) {
      this.auth.followItems('prx:series-search', params).subscribe(
        series => {
          this.seriesResults = series;
          if (series.length === 0) {
            this.noResults = true;
            this.totalCount = 0;
          } else {
            this.totalCount = series[0].total();
          }
          this.pagingInfo(this.searchSeriesParams.perPage);
          this.isLoaded = true;
        },
        err => {
          this.searchError = true;
          this.isLoaded = true;
          this.noResults = false;
          this.clearResults();
        }
      );
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

  addWildcard(query: string) {
    if (query && query.length && query.match(/[0-9a-zA-Z]$/)) {
      return query + '*';
    } else {
      return query;
    }
  }
}
