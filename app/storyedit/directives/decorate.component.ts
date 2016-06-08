import {Component, OnDestroy} from 'angular2/core';
import {Subscription} from 'rxjs';
import {StoryModel} from '../models/story.model';
import {StoryTabService} from '../services/storytab.service';

@Component({
  selector: 'newstory-decorate',
  styleUrls: [],
  template: `
    <div *ngIf="story">
      <h1>Decorate your content</h1>
      <p>Decorate</p>
      <p>{{story.title}}</p>
      <br/><br/>
      <p>Decorate</p>
      <br/><br/>
      <p>Decorate</p>
      <br/><br/>
      <p>Decorate</p>
      <br/><br/>
      <p>Decorate</p>
    </div>
  `
})

export class DecorateComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: StoryTabService) {
    tab.setHero('Step 2: Decorate your Story!');
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
