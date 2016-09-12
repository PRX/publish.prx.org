import { Component, OnInit } from '@angular/core';
import { CmsService, HalDoc, SpinnerComponent } from '../shared';
import { StoryModel } from '../shared/model/story.model';
import { HomeStoryComponent } from '../home/directives/home-story.component';

@Component({
  directives: [SpinnerComponent, HomeStoryComponent],
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
          this.stories = [new StoryModel(this.auth)];
          for (let story of storyDocs) {
            this.stories.push(new StoryModel(this.auth, story, false));
          }
          this.totalCount = auth.count('prx:stories');
          this.isLoaded = true;
        });
      }
    });
  }

}
