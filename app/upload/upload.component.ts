import {Component, Input} from '@angular/core';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {StoryModel} from '../storyedit/models/story.model';
import {AudioVersionComponent} from './directives/audio-version.component';

@Component({
  directives: [SpinnerComponent, AudioVersionComponent],
  selector: 'audio-uploader',
  styleUrls: ['app/upload/upload.component.css'],
  template: `
    <spinner *ngIf="!story || !story.versions"></spinner>
    <div *ngIf="story && story.versions">
      <audio-version *ngFor="let v of story.versions" [version]="v">
      </audio-version>
      <div *ngIf="!story.versions.length">
        <h1>You have no audio versions for this story. How did that happen?</h1>
      </div>
    </div>
  `
})
export class UploadComponent {

  @Input() story: StoryModel;

}
