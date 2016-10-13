import { Component, Input } from '@angular/core';
import { StoryModel } from '../model';

@Component({
  selector: 'publish-audio-upload',
  styleUrls: ['audio-upload.component.css'],
  template: `
    <publish-spinner *ngIf="!story?.versions"></publish-spinner>
    <div *ngIf="story?.versions">
      <publish-audio-version *ngFor="let v of story.versions" [version]="v">
      </publish-audio-version>
      <div *ngIf="!story.versions.length">
        <h1>You have no audio versions for this story. How did that happen?</h1>
      </div>
    </div>
  `
})
export class AudioUploadComponent {

  @Input() story: StoryModel;

}
