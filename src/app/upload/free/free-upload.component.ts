import { Component, Input } from '@angular/core';
import { AudioVersionModel, AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-free-upload',
  styleUrls: ['../shared/audio.css', 'free-upload.component.css'],
  template: `
    <div *ngIf="!file.isDestroy" [publishAudioClasses]="file">

      <div class="reorder">
        <button class="btn-icon icon-menu drag-handle" aria-label="Reorder"></button>
      </div>

      <div class="main">
        <div class="type">
          <input type="text" [ngModel]="file.label" (ngModelChange)="labelChange($event)"
            [class.changed]="labelChanged" [class.invalid]="labelInvalid"/>
        </div>
        <div class="info">
          <span>{{file.filename}}</span>
          <publish-audio-duration [file]="file"></publish-audio-duration>
          <publish-audio-player [file]="file"></publish-audio-player>
        </div>
        <publish-audio-state [file]="file"></publish-audio-state>
      </div>

      <div class="cancel">
        <button class="btn-icon icon-cancel" [publishAudioCancel]="file" [version]="version" aria-label="Remove"></button>
      </div>

    </div>
  `
})

export class FreeUploadComponent {

  @Input() version: AudioVersionModel;
  @Input() file: AudioFileModel;

  labelChange(value: string) {
    this.file.set('label', value);
  }

  get labelChanged(): boolean {
    return !this.file.isNew && this.file.changed('label');
  }

  get labelInvalid(): boolean {
    return this.file.invalid('label') ? true : false;
  }

}
