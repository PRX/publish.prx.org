import { Component, Input } from '@angular/core';
import { AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-audio-duration',
  template: `
    <span *ngIf="hasDuration">({{file.duration | duration}})</span>
    <span *ngIf="file?.size && !hasDuration">({{file.size | filesize}})</span>
  `
})

export class AudioDurationComponent {

  @Input() file: AudioFileModel;

  get hasDuration(): boolean {
    return this.file && (this.file.duration !== null && this.file.duration !== undefined);
  }

}
