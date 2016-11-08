import { Component, Input } from '@angular/core';
import { AudioVersionModel, AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-free-upload',
  styleUrls: ['../shared/audio.css', 'free-upload.component.css'],
  template: `
    <div *ngIf="!file.isDestroy" class="audio" [class.changed]="file.changed()">
      <div class="reorder">
        <i *ngIf="!canceled" class="icon-menu drag-handle"></i>
      </div>

      <div class="main">
        <div class="type">
          <span>{{file.label}}</span>
        </div>
        <div class="info">
          <span>{{file.filename}}</span>
          <span *ngIf="file.duration" class="size">({{file.duration | duration}})</span>
          <span *ngIf="!file.duration && file.size" class="size">({{file.size | filesize}})</span>
        </div>
      </div>

      <div class="cancel">
        <i *ngIf="!canceled" class="icon-cancel" (click)="onCancel($event)"></i>
      </div>
    </div>
  `
})

export class FreeUploadComponent {

  @Input() version: AudioVersionModel;
  @Input() file: AudioFileModel;

}
