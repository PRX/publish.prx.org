import { Component, Input, ElementRef } from '@angular/core';
import { PlayerService, UUID, UploadService } from '../../core';
import { AudioVersionModel } from '../../shared';

@Component({
  selector: 'publish-audio-input',
  styleUrls: ['audio-input.component.css'],
  template: `
    <input type="file" [accept]="acceptWildcard" publishFileSelect [id]="uuid"
      [attr.multiple]="multiple" (file)="addFile($event)"/>
    <label *ngIf="multiple" class="button" [htmlFor]="uuid">Upload Files</label>
    <label *ngIf="!multiple" class="button" [htmlFor]="uuid">Upload File</label>
  `
})

export class AudioInputComponent {

  @Input() multiple = null;
  @Input() version: AudioVersionModel;
  @Input() position: number;
  @Input() accept: string;

  uuid: string;

  constructor(
    private el: ElementRef,
    private player: PlayerService,
    private uploadService: UploadService
  ) {
    this.uuid = UUID.UUID();
  }

  get acceptWildcard(): string {
    if (this.accept && this.accept.match(/audio/i)) {
      return 'audio/*';
    } else if (this.accept && this.accept.match(/video/i)) {
      return 'video/*';
    } else {
      return '*';
    }
  }

  click() {
    this.el.nativeElement.getElementsByTagName('input')[0].click();
  }

  addFile(file: File) {
    this.player.checkFile(file).subscribe(data => {
      this.uploadService.add(file).subscribe(upload => {
        const audio = this.version.addUpload(upload, this.position);
        audio.set('format', data.format);
        if (data.duration === null || data.duration === undefined) {
          audio.set('duration', null);
        } else if (data.duration > 0 && data.duration < 1000) {
          audio.set('duration', 1); // round up
        } else {
          audio.set('duration', Math.round(data.duration / 1000));
        }
        audio.set('bitrate', data.bitrate);
        audio.set('frequency', data.frequency);
      });
    });
  }

}
