import {Component, Input} from 'angular2/core';
import {StoryModel} from '../models/story.model';

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

export class DecorateComponent {

  @Input() public story: StoryModel;

}
