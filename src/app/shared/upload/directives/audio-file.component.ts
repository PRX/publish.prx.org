import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AudioFileModel } from '../../model';
import { UploadService } from '../../../core';

@Component({
  selector: 'publish-audio-file',
  styleUrls: ['audio-file.component.css'],
  template: `
    <div *ngIf="audio && !audio.isDestroy" class="audio-file"
      [class.canceled]="canceled" [class.changed]="audio.changed()">

      <div class="reorder">
        <i *ngIf="!canceled" class="icon-menu drag-handle"></i>
      </div>

      <div class="main">

        <div class="type">
          <span>Segment</span>
          <i class="icon-down-dir"></i>
        </div>

        <div class="info">
          <span>{{audio.filename}}</span>
          <span *ngIf="audio.duration" class="size">({{audio.duration | duration}})</span>
          <span *ngIf="!audio.duration && audio.size" class="size">({{audio.size | filesize}})</span>
        </div>

        <div *ngIf="canceled" class="progress canceled">
          <p *ngIf="audio.isUploading">Upload Canceled</p>
          <p *ngIf="!audio.isUploading">File Deleted</p>
        </div>

        <div *ngIf="!canceled && audio.isUploadError" class="progress errored">
          <p>Upload Error</p>
          <div *ngIf="audio.upload" class="retry">
            <a class="icon-cw" href="" (click)="onRetry($event)">Try Again</a>
          </div>
        </div>

        <div *ngIf="!canceled && audio.isUploading && !audio.isUploadError" class="progress uploading">
          <p>Uploading</p>
          <div class="meter">
            <span [style.width.%]="audio.progress * 100"></span>
          </div>
        </div>

        <div *ngIf="!canceled && audio.isProcessError" class="progress errored">
          <p>{{audio.isProcessError}}</p>
          <div class="retry">
            <a class="icon-cw" href="" (click)="onRetry($event)">Try Again</a>
          </div>
        </div>

        <div *ngIf="!canceled && audio.isProcessing" class="progress processing">
          <p>Processing</p>
          <div class="meter">
            <span [style.width.%]="audio.progress * 100"></span>
          </div>
        </div>

      </div>

      <div class="cancel">
        <i *ngIf="!canceled" class="icon-cancel" (click)="onCancel($event)"></i>
      </div>
    </div>
  `
})

export class AudioFileComponent implements OnInit, OnDestroy {

  canceled: boolean;

  @Input() audio: AudioFileModel;
  @Output() cancel = new EventEmitter<string>();

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    if (this.audio && this.audio.uuid) {
      let upload = this.uploadService.find(this.audio.uuid);
      if (upload) {
        this.audio.watchUpload(upload, false);
      }
    }
  }

  ngOnDestroy() {
    if (this.audio) {
      this.audio.unsubscribe();
    }
  }

  onCancel(event: Event) {
    event.preventDefault();

    // wait for fade-out before parent removes this component
    this.canceled = true;
    setTimeout(() => {
      this.audio.destroy();
      if (this.audio.uuid) {
        this.cancel.emit(this.audio.uuid);
      }
      this.canceled = false;
    }, 1000);
  }

  onRetry(event: Event) {
    event.preventDefault();
    if (this.audio.isUploading) {
      this.audio.retryUpload();
    } else {
      this.audio.retryProcessing();
    }
  }
}
