import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {FileSizePipe} from '../../shared/file/filesize.pipe';
import {AudioModel} from '../models/audio.model';

@Component({
  host: {
    '[class.canceled]': 'canceled'
  },
  pipes: [FileSizePipe],
  selector: 'audio-file',
  styleUrls: ['app/upload/directives/audio-file.component.css'],
  template: `
    <div class="reorder">
      <i *ngIf="!canceled && !audio.isUploading" class="icon-menu drag-handle"></i>
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

      <div *ngIf="canceled" class="progress canceled">
        <p *ngIf="audio.isUploading">Upload Canceled</p>
        <p *ngIf="!audio.isUploading">File Deleted</p>
      </div>

      <div *ngIf="!canceled && !audio.isDone" [class]="progressClass">
        <p>{{statusString}}</p>
        <div *ngIf="audio.isError">
          <a class="icon-cw" href="#" (click)="onRetry($event)">Try Again</a>
        </div>
        <div *ngIf="!audio.isError && audio.isUploading" class="meter">
          <span [style.width]="audio.progress | percent:'1.0-0'"></span>
        </div>
        <div *ngIf="!audio.isError && !audio.isUploading" class="meter">
          <span [style.width]="audio.progress | percent:'1.0-0'"></span>
        </div>
      </div>
    </div>

    <div class="cancel">
      <i *ngIf="!canceled" class="icon-cancel" (click)="onCancel($event)"></i>
    </div>
  `
})

export class AudioFileComponent {

  canceled: boolean;

  @Input() audio: AudioModel;
  @Output() remove = new EventEmitter();

  get progressClass(): string {
    if (this.audio.isError) {
      return 'progress errored';
    } else if (this.audio.isUploading) {
      return 'progress uploading';
    } else if (this.audio.isProcessing) {
      return 'progress processing';
    } else {
      return 'progress';
    }
  }

  get statusString(): string {
    if (this.audio.status) {
      return this.audio.status.replace(/(?:^|\s)\S/g, (char) => {
        return char.toUpperCase();
      });
    } else {
      return 'Unknown';
    }
  }

  onCancel(event: Event) {
    event.preventDefault();
    this.audio.destroy();

    // wait for fade-out before parent removes this component
    this.canceled = true;
    setTimeout(() => { this.remove.emit(true); }, 1000);
  }

  onRetry(event: Event) {
    event.preventDefault();
    if (this.audio.isUploading) {
      this.audio.startUpload();
    } else {
      alert('TODO: retry non-uploader failure');
    }
  }
}
