import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {StoryModel} from '../models/story.model';
import {StoryTabService} from '../services/storytab.service';

@Component({
  selector: 'newstory-sell',
  styleUrls: [],
  template: `
    <div *ngIf="story">
      <h1>Sell your content</h1>
      <p>Sell</p>
      <p>{{story.title}}</p>
      <br/><br/>
      <p>Sell</p>
      <br/><br/>
      <p>Sell</p>
      <br/><br/>
      <p>Sell</p>
      <br/><br/>
      <p>Sell</p>
    </div>
  `
})

export class SellComponent implements OnDestroy {

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: StoryTabService) {
    this.tabSub = tab.storyModel.subscribe((story) => {
      this.story = story;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
