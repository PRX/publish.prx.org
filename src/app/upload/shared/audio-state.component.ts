import { Component, Input, HostBinding, DoCheck } from '@angular/core';
import { AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-audio-state',
  styleUrls: ['audio-state.component.css'],
  template: `
    <div [ngSwitch]="fileState" class="state">

      <div *ngSwitchCase="'canceled'">
        <p *ngIf="file.isUploading">Upload Canceled</p>
        <p *ngIf="!file.isUploading">File Deleted</p>
      </div>

      <div *ngSwitchCase="'upload-errored'">
        <p>Upload Error: {{file.isUploadError}}</p>
        <div *ngIf="file.upload" class="retry">
          <button class="btn-link icon-cw" (click)="onRetry()">Try Again</button>
        </div>
      </div>

      <div *ngSwitchCase="'uploading'">
        <p>Uploading</p>
        <div class="meter">
          <span [style.width.%]="file.progress * 100"></span>
        </div>
      </div>

      <div *ngSwitchCase="'process-errored'">
        <p>{{file.isProcessError}}</p>
        <div class="retry">
          <button class="btn-link icon-cw" (click)="onRetry()">Try Again</button>
        </div>
      </div>

      <div *ngSwitchCase="'processing'">
        <p>Processing</p>
        <div class="meter">
          <span [style.width.%]="file.progress * 100"></span>
        </div>
      </div>

      <div *ngSwitchCase="'invalid'">
        <p>{{file.invalid() | capitalize}}</p>
      </div>

    </div>
  `
})

export class AudioStateComponent implements DoCheck {

  @Input() file: AudioFileModel;

  @HostBinding('class') fileState: string;

  ngDoCheck() {
    if (!this.file) {
      this.fileState = '';
      return;
    }

    if (this.file.canceled) {
      this.fileState = 'canceled';
    } else if (this.file.isUploadError) {
      this.fileState = 'upload-errored';
    } else if (this.file.isUploading) {
      this.fileState = 'uploading';
    } else if (this.file.isProcessError) {
      this.fileState = 'process-errored';
    } else if (this.file.isProcessing) {
      this.fileState = 'processing';
    } else if (this.file.invalid()) {
      this.fileState = 'invalid';
    } else {
      this.fileState = '';
    }
  }

  onRetry() {
    if (this.file.isUploading) {
      this.file.retryUpload();
    } else {
      this.file.retryProcessing();
    }
  }

}
