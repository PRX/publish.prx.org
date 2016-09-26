import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CmsService, HalDoc } from '../core';
import { StoryModel, SeriesModel } from '../shared';

@Component({
  selector: 'publish-search',
  styleUrls: ['search.component.css'],
  templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit {

  selectedTab: string;

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

  searchText: string;
  searchSeriesId: number;
  searchSeries: SeriesModel;
  allSeriesIds: number[];
  allSeries: any;

  constructor(private cms: CmsService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.selectedTab = params['tab'];
      this.searchSeriesId = +params['seriesId'];

      this.cms.follow('prx:authorization').subscribe((auth) => {
        this.auth = auth;

        this.allSeriesIds = [-1];
        this.allSeries = {};
        auth.followItems('prx:series', {filters: 'v4'}).subscribe((series) => {
          for (let s of <HalDoc[]> series) {
            this.allSeriesIds.push(s.id);
            this.allSeries[s.id] = new SeriesModel(auth, s, false);
          }

          this.searchText = '';
          this.searchSeries = null;
          this.currentPage = 1;
          if (this.searchSeriesId) {
            this.searchStoriesBySeries(this.searchSeriesId);
          } else {
            this.searchStories(1);
          }
        });
      });
    });
  }

  searchStoriesByText(text: string) {
    this.searchText = text;
    this.searchStories(1);
  }

  searchStoriesBySeries(searchSeriesId: number) {
    this.searchSeriesId = searchSeriesId;
    this.searchSeries = this.allSeries[this.searchSeriesId];
    this.searchStories(1);
  }

  searchStories(page: number, per = 12) {
    this.currentPage = page;
    this.isLoaded = false;
    this.noStories = false;

    let parent = this.searchSeries ? this.searchSeries.doc : this.auth;

    let filters = ['v4'];
    if (+this.searchSeriesId === -1) {
      filters.push('noseries');
    }
    if (this.searchText) {
      filters.push('text=' + this.searchText);
    }
    let params = {page: this.currentPage, per, filters: filters.join(',')};

    let storiesCount = parent.count('prx:stories') || 0; // wrong, doesn't account for filter. looks obvs wrong with No Series filter
    if (storiesCount > 0) {
      this.storyLoaders = Array(storiesCount);
      parent.followItems('prx:stories', params).subscribe((stories) => {
        this.stories = [];
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
        this.totalCount = storyDocs.length > 0 ? storyDocs[0].total() : 0;
        this.pagingInfo(per);
        this.isLoaded = true;
      });
    } else {
      this.noStories = true;
      this.isLoaded = true;
      this.totalCount = 0;
      this.pagingInfo(per);
    }
  }

  pagingInfo(per) {
    let totalPages = this.totalCount % per ? Math.floor(this.totalCount) / per + 1 : Math.floor(this.totalCount / per);
    this.pages = Array.apply(null, {length: totalPages}).map((val, i) => i + 1);
    this.pagesBegin = this.showNumPages * Math.floor((this.currentPage - 1) / this.showNumPages);
    this.pagesEnd = this.showNumPages * Math.ceil(this.currentPage / this.showNumPages);
  }

}
