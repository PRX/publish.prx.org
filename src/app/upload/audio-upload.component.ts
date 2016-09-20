import { Component, Input } from '@angular/core';
import { StoryModel } from '../shared';

@Component({
  selector: 'audio-upload',
  styleUrls: ['audio-upload.component.css'],
  template: `
    <publish-spinner *ngIf="!story || !story.versions"></publish-spinner>
    <div *ngIf="story && story.versions">
      <audio-version *ngFor="let v of story.versions" [version]="v">
      </audio-version>
      <div *ngIf="!story.versions.length">
        <h1>You have no audio versions for this story. How did that happen?</h1>
      </div>
    </div>
  `
})
export class AudioUploadComponent {

  @Input() story: StoryModel;

}
