import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AudioFileModel } from '../../model';
import { HalDoc, UploadService } from '../../../core';

@Component({
  selector: 'publish-audio-file',
  styleUrls: ['audio-file.component.css'],
  templateUrl: 'audio-file.component.html'
})

export class AudioFileComponent implements OnInit, OnDestroy {

  canceled: boolean;

  @Input() audio: AudioFileModel;
  @Input() placeholder: HalDoc;
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
