import {Component, Input} from 'angular2/core';
import {FileSizePipe} from '../../shared/file/filesize.pipe';
import {AudioFileModel} from '../../storyedit/models/audio-file.model';

@Component({
  pipes: [FileSizePipe],
  selector: 'audio-file',
  styleUrls: ['app/upload/directives/audio-file.component.css'],
  template: `
    <div *ngIf="!audio.isDestroy" class="audio-file" [class.canceled]="canceled">
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
          <span class="size">({{audio.size | filesize}})</span>
        </div>

        <div *ngIf="canceled" class="progress canceled">
          <p *ngIf="audio.isUploading">Upload Canceled</p>
          <p *ngIf="!audio.isUploading">File Deleted</p>
        </div>

        <div *ngIf="!canceled && audio.isUploading && audio.isError" class="progress error">
          <p>Upload Error</p>
          <div *ngIf="audio.isError && audio.upload" class="retry">
            <a class="icon-cw" href="#" (click)="onRetry($event)">Try Again</a>
          </div>
        </div>

        <div *ngIf="!canceled && audio.isUploading && !audio.isError" class="progress uploading">
          <p>Uploading</p>
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

export class AudioFileComponent {

  canceled: boolean;

  @Input() audio: AudioFileModel;

  onCancel(event: Event) {
    console.log('onCancel');
    event.preventDefault();

    // wait for fade-out before parent removes this component
    this.canceled = true;
    setTimeout(() => { this.audio.destroy(); }, 1000);
  }

  onRetry(event: Event) {
    console.log('onRetry');
    event.preventDefault();
    if (this.audio.isUploading) {
      this.audio.retryUpload();
    } else {
      alert('TODO: retry non-uploader failure');
    }
  }
}
