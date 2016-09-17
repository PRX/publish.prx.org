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
  genres: string[];
  subGenres: string[];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.search('', 1);
  }

  search(term: string, page: number, per: number = 10) {
    this.searchTerm = term;
    this.currentPage = page;
    this.isLoaded = false;

    this.cms.follow('prx:authorization').subscribe((auth) => {
      this.auth = auth;
      let storiesCount = auth.count('prx:stories') || 0;
      if (storiesCount < 1) {
        this.noStories = true;
        this.isLoaded = true;
      } else {
        this.storyLoaders = Array(storiesCount);

        let draftStory = new StoryModel(this.auth);
        let isUnsavedDraft = draftStory.isNew && draftStory.isStored();
        let showUnsavedDraft = this.currentPage === 1 && isUnsavedDraft;

        let requestPer = showUnsavedDraft ? per - 1 : per;

        auth.followItems('prx:stories', {page: this.currentPage, per: requestPer}).subscribe((stories) => {
          this.stories = showUnsavedDraft ? [draftStory] : [];
          this.storyLoaders = null;
          let storyDocs = <HalDoc[]> stories;
          for (let doc of storyDocs) {
            let story = new StoryModel(this.auth, doc, false);
            // TODO: a lot of these stories on the search page will likely be from the same series, not good that it's getting each just for the title
            if (story.doc.has('prx:series')) {
              story.doc.follow('prx:series').subscribe((series) => {
                story.parent = <HalDoc> series;
                this.stories.push(story);
              });
            } else {
              this.stories.push(story);
            }
          }
          this.totalCount = isUnsavedDraft ? auth.count('prx:stories') + 1 : auth.count('prx:stories');
          let totalPages = this.totalCount % per ? Math.floor(this.totalCount) / per + 1 : Math.floor(this.totalCount / per);
          this.pages = Array.apply(null, {length: totalPages}).map((val, i) => i + 1);
          this.pagesBegin = this.showNumPages * Math.floor((this.currentPage - 1) / this.showNumPages);
          this.pagesEnd = this.showNumPages * Math.ceil(this.currentPage / this.showNumPages);
          this.isLoaded = true;
        });
      }
    });
  }

}
