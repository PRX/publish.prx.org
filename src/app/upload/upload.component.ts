import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { HalDoc } from '../core';
import { AudioFileModel, AudioVersionModel } from '../shared';

@Component({
  selector: 'publish-upload',
  styleUrls: ['upload.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span *ngIf="DESCRIPTIONS[version.label]">{{DESCRIPTIONS[version.label]}}</span>
    </header>

    <section *ngIf="version.hasFileTemplates">
      <div class="uploads">
        <template ngFor let-ft [ngForOf]="version.filesAndTemplates">
          <publish-templated-upload *ngIf="ft.tpl" [template]="ft.tpl"
            [file]="ft.file" [version]="version"></publish-templated-upload>
          <publish-illegal-upload *ngIf="!ft.tpl" [file]="ft.file"
            [version]="version"></publish-illegal-upload>
        </template>
      </div>
    </section>

    <section *ngIf="!version.hasFileTemplates">
      <div class="uploads" [publishFreeReorder]="version">
        <div *ngIf="version.noAudioFiles" class="empty">
          <h4 (click)="upinput.click()">Upload a file to get started</h4>
        </div>
        <publish-free-upload *ngFor="let f of version.files"
          [file]="f" [version]="version"></publish-free-upload>
      </div>
    </section>

    <footer [class.templated]="version.hasFileTemplates">
      <p *ngIf="versionInvalid" class="error">{{this.version.invalid('self') | capitalize}}</p>
      <publish-audio-input *ngIf="!version.hasFileTemplates" #upinput
        multiple=true [version]="version"></publish-audio-input>
    </footer>
  `
})

export class UploadComponent implements OnInit {

  @Input() version: AudioVersionModel;

  templatedFiles: { file: AudioFileModel; template: HalDoc; }[] = [];

  illegalFiles: AudioFileModel[] = [];

  versionDescription: string;

  DESCRIPTIONS = {
    'DEFAULT': 'The primary mp3 version of your story',
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy',
    'Promos': 'The promotional version of your audio'
  };

  @HostBinding('class.changed') get versionChanged(): boolean {
    if (this.version) {
      return this.version.audioCount !== this.version.files.length;
    } else {
      return false;
    }
  }

  @HostBinding('class.invalid') get versionInvalid(): boolean {
    return this.version.changed() && !!this.version.invalid('self');
  }

  ngOnInit() {
    if (this.version && this.DESCRIPTIONS[this.version.label]) {
      this.versionDescription = this.DESCRIPTIONS[this.version.label];
    } else {
      this.versionDescription = this.DESCRIPTIONS.DEFAULT;
    }
  }

}
