import {Component, Input} from 'angular2/core';
import {StoryModel} from '../models/story.model';

@Component({
  selector: 'newstory-edit',
  styleUrls: [],
  template: `
    <div *ngIf="story && story.isLoaded">
      <h1>Edit your content</h1>
      <p>{{story.title}}</p>
      <br/><br/>
      <p>Edit</p>
      <br/><br/>
      <p>Edit</p>
      <br/><br/>
      <p>Edit</p>
      <br/><br/>
      <p>Edit</p>
    </div>
  `
})

export class EditComponent {

  @Input() public story: StoryModel;

}
