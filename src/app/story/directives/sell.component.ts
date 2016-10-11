import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';

@Component({
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

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
