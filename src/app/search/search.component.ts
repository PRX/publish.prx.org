import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CmsService, HalDoc } from '../core';
import { StoryModel, SeriesModel } from '../shared';

@Component({
  selector: 'publish-search',
  styleUrls: ['search.component.css'],
  templateUrl: 'search.component.html'
})

export class SearchComponent implements OnChanges, OnInit {

  static TAB_STORIES = 'stories';
  static TAB_SERIES = 'series';
  selectedTab: string;
  private routeSub: Subscription;

  isLoaded = false;
  totalCount: number;
  pages: number[];
  noResults: boolean;
  auth: HalDoc;
  storiesResults: StoryModel[];
  seriesResults: SeriesModel[];
  loaders: boolean[];

  currentPage: number;
  showNumPages: number = 10;
  pagesBegin: number;
  pagesEnd: number;

  searchTextParam: string;
  searchGenre: string;
  searchSubGenre: string;
  searchSeriesIdParam: number;
  searchSeriesParam: SeriesModel;
  allSeriesIds: number[];
  allSeries: any;

  constructor(private cms: CmsService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.selectedTab = params['tab'] || SearchComponent.TAB_STORIES;
      this.searchSeriesIdParam = +params['seriesId'];

      this.cms.follow('prx:authorization').subscribe((auth) => {
        this.auth = auth;
        if (this.selectedTab === SearchComponent.TAB_STORIES) {
          this.initStorySearch();
        } else {
          this.initSeriesSearch();
        }
      });
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  initStorySearch() {
    this.allSeriesIds = [-1];
    this.allSeries = {};
    this.auth.followItems('prx:series', {filters: 'v4'}).subscribe((series) => {
      for (let s of <HalDoc[]> series) {
        this.allSeriesIds.push(s.id);
        this.allSeries[s.id] = new SeriesModel(this.auth, s, false);
      }

      this.searchTextParam = '';
      this.searchSeriesParam = null;
      this.currentPage = 1;
      if (this.searchSeriesIdParam) {
        this.searchStoriesBySeries(this.searchSeriesIdParam);
      } else {
        this.searchStories(1);
      }
    });
  }

  initSeriesSearch() {
    this.searchSeries(1);
  }

  ngOnChanges(changes) {

  }

  searchByText(text: string) {
    this.searchTextParam = text;
    this.search(1);
  }

  searchStoriesBySeries(searchSeriesId: number) {
    this.searchSeriesIdParam = searchSeriesId;
    this.searchSeriesParam = this.allSeries[this.searchSeriesIdParam];
    this.searchStories(1);
  }

  searchSeriesByGenre(genre: any) {
    this.searchGenre = genre.genre;
    this.searchSubGenre = genre.subgenre;
    this.searchSeries(1);
  }

  search(page: number, per: number = undefined) {
    if (this.isOnSeriesTab()) {
      this.searchSeries(page, per);
    } else if (this.isOnStoriesTab) {
      this.searchStories(page, per);
    }
  }

  searchStories(page: number, per = 12) {
    this.currentPage = page;
    this.isLoaded = false;
    this.noResults = false;

    let parent = this.searchSeriesParam ? this.searchSeriesParam.doc : this.auth;

    let filters = ['v4'];
    if (+this.searchSeriesIdParam === -1) {
      filters.push('noseries');
    }
    if (this.searchTextParam) {
      filters.push('text=' + this.searchTextParam);
    }
    let params = {page: this.currentPage, per, filters: filters.join(',')};

    let storiesCount = parent.count('prx:stories') || 0; // wrong, doesn't account for filter. looks obvs wrong with No Series filter
    if (storiesCount > 0) {
      this.loaders = Array(storiesCount);
      parent.followItems('prx:stories', params).subscribe((stories) => {
        this.storiesResults = [];
        this.loaders = null;
        let storyDocs = <HalDoc[]> stories;
        for (let doc of storyDocs) {
          let story = new StoryModel(parent, doc, false);
          if (story.doc.has('prx:series')) {
            // series are embedded, so this should be ok. would prefer to get the series id and use allSeries[id].doc
            story.doc.follow('prx:series').subscribe((series) => {
              story.parent = series;
              this.storiesResults.push(story); // TODO: can cause out of order issues
            });
          } else {
            this.storiesResults.push(story);
          }
        }
        this.totalCount = storyDocs.length > 0 ? storyDocs[0].total() : 0;
        this.pagingInfo(per);
        this.isLoaded = true;
      });
    } else {
      this.noResults = true;
      this.isLoaded = true;
      this.totalCount = 0;
      this.pagingInfo(per);
    }
  }

  searchSeries(page: number, per = 10) {
    this.currentPage = page;
    this.isLoaded = false;
    this.noResults = false;

    let filters = ['v4'];
    if (this.searchTextParam) {
      filters.push('text=' + this.searchTextParam);
    }
    let params = {page: this.currentPage, per, filters: filters.join(',')};
    let seriesCount = this.auth.count('prx:series') || 0;
    if (seriesCount > 0) {
      this.loaders = Array(seriesCount);
      this.auth.followItems('prx:series', params).subscribe((seriesResults) => {
        this.seriesResults = [];
        this.loaders = null;
        let seriesDocs = <HalDoc[]> seriesResults;
        for (let doc of seriesDocs) {
          this.seriesResults.push(new SeriesModel(this.auth, doc, false));
        }
        this.totalCount = seriesDocs.length > 0 ? seriesDocs[0].total() : 0
        this.pagingInfo(per);
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
    this.router.navigate(['search', { tab: SearchComponent.TAB_STORIES}]);
  }

  searchSeriesTab() {
    this.router.navigate(['search', { tab: SearchComponent.TAB_SERIES}]);
  }

  isOnSeriesTab() {
    return this.selectedTab === SearchComponent.TAB_SERIES;
  }

  isOnStoriesTab() {
    return this.selectedTab === SearchComponent.TAB_STORIES;
  }
}
