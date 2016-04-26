import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {FileSizePipe} from '../../shared/file/filesize.pipe';
import {AudioModel} from '../models/audio.model';

@Component({
  pipes: [FileSizePipe],
  selector: 'audio-file',
  styleUrls: ['app/upload/directives/audio-file.component.css'],
  template: `
    <div class="audio-file">

      <div class="reorder">
        <i class="icon-menu"></i>
      </div>

      <div class="main">

        <div class="type">
          <span>Segment</span>
          <i class="icon-down-dir"></i>
        </div>

        <div class="info">
          <span>{{audio.filename}}</span>
          <span class="size">({{audio.size | filesize}})</span>
        </div>

        <div *ngIf="uploading" class="progress uploading">
          <p>{{audio.status}}</p>
          <div class="meter">
            <span [style.width]="audio.progress | percent:'1.0-0'"></span>
          </div>
        </div>
        <div *ngIf="processing" class="progress processing">
          <p>{{audio.status}}</p>
          <div class="meter">
            <span [style.width]="audio.progress | percent:'1.0-0'"></span>
          </div>
        </div>
        <div *ngIf="errored" class="progress errored">
          <p>{{audio.status}} Error</p>
          <a class="icon-cw" href="#" (click)="onRetry($event)">Try Again</a>
        </div>
        <div *ngIf="canceled" class="progress canceled">
          <p>Upload Canceled</p>
        </div>

      </div>

      <div class="cancel" *ngIf="!canceled">
        <i class="icon-cancel" (click)="onCancel($event)"></i>
      </div>

    </div>
  `
})

export class AudioFileComponent {

  canceled: boolean;

  @Input() audio: AudioModel;
  @Output() cancel = new EventEmitter();

  // Audio-file status helpers
  get uploading(): boolean {
    return this.audio.isStatus('uploading') && !this.audio.error && !this.canceled;
  };
  get processing(): boolean {
    return !this.audio.isStatus('uploading') && !this.audio.error && !this.canceled;
  };

  onCancel(event: Event) {
    event.preventDefault();
    this.canceled = true;
    console.log('TODO: cancel/delete audio');
    setTimeout(() => { this.cancel.emit(true); }, 500);
  }

  onRetry(event: Event) {
    event.preventDefault();
    this.audio.startUpload();
  }
}
