import { Component, Input } from '@angular/core';
import {
  AudioVersionModel,
  AudioFileModel,
  AudioVersionTemplateModel
} from '../../shared';

@Component({
  selector: 'publish-templated-upload',
  styleUrls: ['../shared/audio.css', 'templated-upload.component.css'],
  template: `
    <div *ngIf="file && !file.isDestroy" [publishAudioClasses]="file">

      <div class="main">
        <div class="type">
          <span>{{file.label}}</span>
        </div>
        <div class="info">
          <span>{{file.filename}}</span>
          <publish-audio-duration [file]="file"></publish-audio-duration>
          <publish-audio-player [file]="file"></publish-audio-player>
        </div>
        <publish-audio-state [file]="file"></publish-audio-state>
      </div>

      <div class="cancel">
        <i class="icon-cancel" [publishAudioCancel]="file" [version]="version"></i>
      </div>

    </div>
    <div *ngIf="!file || file.isDestroy" class="audio template">

      <div class="main">
        <div class="type">
          <span>{{template.label}}</span>
        </div>
        <div class="info">
          <span *ngIf="template.lengthMinimum && template.lengthMaximum">
            Length between {{template.lengthMinimum | duration}} and {{template.lengthMaximum | duration}}
          </span>
          <span *ngIf="template.lengthMinimum && !template.lengthMaximum">
            Length greater than {{template.lengthMinimum | duration}}
          </span>
          <span *ngIf="!template.lengthMinimum && template.lengthMaximum">
            Length less than {{template.lengthMaximum | duration}}
          </span>
        </div>
      </div>

      <div class="cancel">
        <publish-audio-input [version]="version" [position]="template.position"></publish-audio-input>
      </div>

    </div>
  `
})

export class TemplatedUploadComponent {

  @Input() version: AudioVersionModel;
  @Input() template: AudioVersionTemplateModel;
  @Input() file: AudioFileModel;

}
