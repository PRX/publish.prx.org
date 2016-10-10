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

export class PlayerComponent implements OnDestroy {

  host = 'http://staging.play.prx.tech';

  tt = '230- Project Cybersyn';
  ts = '99% Invisible';
  tc = '';
  ua = 'http://www.podtrac.com/pts/redirect.mp3/media.blubrry.com/99percentinvisible/dovetail.prxu.org/99pi/fe55aefb-4a02-4ff4-9da8-8060a8f15ce9/230-Project-Cybersyn.mp3';
  ui = 'http://cdn.99percentinvisible.org/wp-content/uploads/powerpress/99invisible-logo-1400.jpg';
  uf = 'http://feeds.99percentinvisible.org/99percentinvisible';
  uc = '';
  us = 'http://feeds.99percentinvisible.org/99percentinvisible';
  gs = '_blank';

  story: StoryModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => this.story = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
