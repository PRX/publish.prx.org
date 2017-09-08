import { Component, Input, HostBinding, OnInit, DoCheck } from '@angular/core';
import { AudioVersionModel } from '../shared';

@Component({
  selector: 'publish-upload',
  styleUrls: ['upload.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span>{{versionDescription()}}</span>
    </header>

    <section *ngIf="version.hasFileTemplates">
      <div class="uploads">
        <ng-container *ngFor="let ft of version.filesAndTemplates">
          <publish-templated-upload *ngIf="ft.tpl" [template]="ft.tpl"
            [file]="ft.file" [version]="version" publishClick></publish-templated-upload>
          <publish-illegal-upload *ngIf="!ft.tpl" [file]="ft.file"
            [version]="version"></publish-illegal-upload>
        </ng-container>
      </div>
    </section>

    <section publishClick>
      <section *ngIf="!version.hasFileTemplates">
        <div class="uploads" [publishFreeReorder]="version">
          <label>
            <div *ngIf="version.noAudioFiles" class="empty" >
              <h4>Upload a file to get started</h4>
            </div>
          </label>
          <publish-free-upload *ngFor="let f of version.files"
            [file]="f" [version]="version" publishClick>
          </publish-free-upload>
        </div>
      </section>

      <footer [class.templated]="version.hasFileTemplates">
        <p *ngIf="invalidMessage" class="error">{{invalidMessage | capitalize}}</p>
        <publish-audio-input *ngIf="!version.hasFileTemplates"
          multiple=true [version]="version"></publish-audio-input>
      </footer>
    </section>
  `
})

export class UploadComponent implements DoCheck {

  @Input() version: AudioVersionModel;
  @Input() strict: boolean;

  DESCRIPTIONS = [
    {test: /piece audio/i, desc: 'The standard version of your episode you would most like people to hear and buy'},
    {test: /promos/i, desc: 'The promotional version of your audio'},
    {test: /video/i, desc: 'The video file for your episode'},
    {test: /./, desc: 'The audio files for your episode, in mp3 format.'}
  ];

  @HostBinding('class.changed') changedClass = false;

  @HostBinding('class.invalid') invalidClass = false;

  invalidMessage: string = null;

  ngDoCheck() {
    this.changedClass = false;
    this.invalidClass = false;
    this.invalidMessage = null;
    if (this.version) {
      if (this.version.invalid('files', this.strict)) {
        this.invalidClass = this.versionUploadedInvalid();
      } else if (this.version.invalid('self', this.strict) && this.version.changed()) {
        this.invalidClass = true;
        this.invalidMessage = this.version.invalid('self', this.strict);
      } else if (this.version.changed('files')) {
        this.changedClass = !this.versionUndeletedHaveChanged();
      } else if (this.version.changed(null, false)) {
        this.changedClass = true; // version itself changed, not files
      } else if (this.version.nonMatchingFiles()) {
        this.invalidClass = true;
        this.invalidMessage = this.version.nonMatchingFiles();
      } else if (this.version.status === 'invalid') {
        this.invalidClass = true;
        this.invalidMessage = this.version.statusMessage;
      }
    }
  }

  versionDescription(): string {
    let label = this.version['label'] || '';
    let desc = this.DESCRIPTIONS.find(d => d.test.test(label));
    if (desc) {
      return desc.desc;
    }
    return '';
  }

  versionUploadedInvalid(): boolean {
    return this.version.files.filter(f => !f.isUploading).some(f => !!f.invalid(null, this.strict));
  }

  versionUndeletedHaveChanged(): boolean {
    return this.version.files.filter(f => !f.isDestroy).some(f => f.changed());
  }

}
