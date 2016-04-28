import {Component, Input, OnInit} from 'angular2/core';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {HalDoc} from '../shared/cms/haldoc';
import {StoryModel} from '../storyedit/models/story.model';
import {AudioVersionComponent} from './directives/audio-version.component';

@Component({
  directives: [SpinnerComponent, AudioVersionComponent],
  selector: 'audio-uploader',
  styleUrls: ['app/upload/upload.component.css'],
  template: `
    <div *ngIf="!audioVersions">
      <spinner></spinner>
    </div>
    <div *ngIf="audioVersions && !audioVersions.length">
      <h2>Your story has no versions! Something is terribly wrong</h2>
    </div>
    <audio-version *ngFor="#version of audioVersions" [version]="version">
    </audio-version>
  `
})

export class UploadComponent implements OnInit {

  SHOW_VERSIONS = ['Piece Audio'];

  audioVersions: HalDoc[];

  @Input() story: StoryModel;

  ngOnInit() {
    if (this.story.isNew) {
      this.audioVersions = []; // TODO: how to create upon saving the story?
    } else {
      this.story.doc.followItems('prx:audio-versions').subscribe((docs) => {
        this.audioVersions = docs.filter((doc) => {
          return this.SHOW_VERSIONS.indexOf(doc['label']) > -1;
        });
      });
    }
  }

}
