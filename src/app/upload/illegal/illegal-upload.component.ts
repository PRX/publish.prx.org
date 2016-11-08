import { Component, Input } from '@angular/core';
import { AudioVersionModel, AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-illegal-upload',
  styleUrls: ['../shared/audio.css'],
  template: `
    <div class="audio">
      <h1>Illegal Upload</h1>
    </div>
  `
})

export class IllegalUploadComponent {

  @Input() version: AudioVersionModel;
  @Input() file: AudioFileModel;

}
