import {Component, Input} from 'angular2/core';
import {StoryModel} from '../models/story.model';

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

export class SellComponent {

  @Input() public story: StoryModel;

}
