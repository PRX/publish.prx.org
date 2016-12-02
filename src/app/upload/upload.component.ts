import { Component, Input, HostBinding, OnInit, DoCheck } from '@angular/core';
import { AudioVersionModel } from '../shared';

@Component({
  selector: 'publish-upload',
  styleUrls: ['upload.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span>{{versionDescription}}</span>
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
      <p *ngIf="invalidMessage" class="error">{{invalidMessage | capitalize}}</p>
      <publish-audio-input *ngIf="!version.hasFileTemplates" #upinput
        multiple=true [version]="version"></publish-audio-input>
    </footer>
  `
})

export class UploadComponent implements OnInit, DoCheck {

  @Input() version: AudioVersionModel;

  versionDescription: string;

  DESCRIPTIONS = {
    'DEFAULT': 'The audio files for your piece, in mp3 format.',
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy',
    'Promos': 'The promotional version of your audio'
  };

  @HostBinding('class.changed') changedClass = false;

  @HostBinding('class.invalid') invalidClass = false;

  invalidMessage: string = null;

  ngOnInit() {
    if (this.version && this.DESCRIPTIONS[this.version.label]) {
      this.versionDescription = this.DESCRIPTIONS[this.version.label];
    } else {
      this.versionDescription = this.DESCRIPTIONS.DEFAULT;
    }
  }

  ngDoCheck() {
    this.changedClass = false;
    this.invalidClass = false;
    this.invalidMessage = null;
    if (this.version) {
      if (this.version.invalid('files')) {
        this.invalidClass = this.versionUploadedInvalid();
      } else if (this.version.invalid('self') && this.version.changed()) {
        this.invalidClass = true;
        this.invalidMessage = this.version.invalid('self');
      } else if (this.version.changed('files')) {
        this.changedClass = !this.versionUndeletedHaveChanged();
      } else if (this.version.changed(null, false)) {
        this.changedClass = true; // version itself changed, not files
      }
    }
  }

  versionUploadedInvalid(): boolean {
    return this.version.files.filter(f => !f.isUploading).some(f => !!f.invalid());
  }

  versionUndeletedHaveChanged(): boolean {
    return this.version.files.filter(f => !f.isDestroy).some(f => f.changed());
  }

}
