import { Component, Input } from '@angular/core';
import { StoryModel } from '../model';

@Component({
  selector: 'publish-audio-upload',
  styleUrls: ['audio-upload.component.css'],
  template: `
    <publish-spinner *ngIf="!story?.versions"></publish-spinner>

    <div *ngFor="let v of story?.versions" class="version"
      [class.invalid]="v.invalid()" [class.changed]="v.changed()">

      <publish-audio-version [version]="v"></publish-audio-version>

      <p *ngIf="v.invalid('self')" class="error">{{v.invalid('self') | capitalize}}</p>

    </div>

    <div *ngIf="story?.versions.length === 0">
      <h1>You have no audio versions for this story. How did that happen?</h1>
    </div>
  `
})
export class AudioUploadComponent {

  @Input() story: StoryModel;

}
