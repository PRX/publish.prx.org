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
  noStories: boolean;
  auth: HalDoc;
  stories: StoryModel[];
  storyLoaders: boolean[];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.isLoaded = false;
    this.cms.follow('prx:authorization').subscribe((auth) => {
      this.auth = auth;
      let storiesCount = auth.count('prx:stories') || 0;
      if (storiesCount < 1) {
        this.noStories = true;
        this.isLoaded = true;
      } else {
        this.storyLoaders = Array(storiesCount);
        auth.followItems('prx:stories').subscribe((stories) => {
          this.storyLoaders = null;
          let storyDocs = <HalDoc[]> stories;
          let draftStory = new StoryModel(this.auth);
          this.stories = draftStory.isNew && draftStory.isStored() ? [draftStory] : [];
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
          this.totalCount = auth.count('prx:stories');
          this.isLoaded = true;
        });
      }
    });
  }

}
