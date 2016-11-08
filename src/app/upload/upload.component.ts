import { Component, Input, OnInit } from '@angular/core';
import { AudioVersionModel } from '../shared';

@Component({
  selector: 'publish-upload',
  styleUrls: ['upload.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span *ngIf="DESCRIPTIONS[version.label]">{{DESCRIPTIONS[version.label]}}</span>
    </header>

    <section>
      <div *ngIf="version.hasFileTemplates" class="uploads">
        <publish-templated-upload *ngFor="let t of version.fileTemplates; let i = index"
          [template]="t" [file]="version.files[i]" [version]="version"></publish-templated-upload>
        <template ngFor let-f [ngForOf]="version.files" let-i="index">
          <publish-illegal-upload *ngIf="version.fileTemplates.length && !version.fileTemplates[i]"
            [file]="version.files[i]" [version]="version"></publish-illegal-upload>
        </template>
      </div>
      <div *ngIf="!version.hasFileTemplates" class="uploads" [publishFreeReorder]="version.files">
        <div *ngIf="version.noAudioFiles" class="empty">
          <h4>Upload a file to get started</h4>
        </div>
        <publish-free-upload *ngFor="let f of version.files"
          [file]="f" [version]="version"></publish-free-upload>
      </div>
    </section>

    <footer *ngIf="!version.hasFileTemplates">
      <publish-audio-input multiple=true></publish-audio-input>
    </footer>
  `
})

export class UploadComponent implements OnInit {

  @Input() version: AudioVersionModel;

  versionDescription: string;

  DESCRIPTIONS = {
    'DEFAULT': 'The primary mp3 version of your story',
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy',
    'Promos': 'The promotional version of your audio'
  };

  ngOnInit() {
    if (this.version && this.DESCRIPTIONS[this.version.label]) {
      this.versionDescription = this.DESCRIPTIONS[this.version.label];
    } else {
      this.versionDescription = this.DESCRIPTIONS.DEFAULT;
    }
  }

}
