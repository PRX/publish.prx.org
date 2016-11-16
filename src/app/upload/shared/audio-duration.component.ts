import { Component, Input } from '@angular/core';
import { AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-audio-duration',
  template: `
    <span *ngIf="file.duration">({{file.duration | duration}})</span>
    <span *ngIf="!file.duration && file.size">({{file.size | filesize}})</span>
  `
})

export class AudioDurationComponent {

  @Input() file: AudioFileModel;

}
