import { Component, Input } from '@angular/core';
import {
  AudioVersionModel,
  AudioFileModel,
  AudioVersionTemplateModel
} from '../../shared';

@Component({
  selector: 'publish-templated-upload',
  styleUrls: ['templated-upload.component.css'],
  template: `
    <h1>Templated upload here</h1>
  `
})

export class TemplatedUploadComponent {

  @Input() version: AudioVersionModel;
  @Input() template: AudioVersionTemplateModel;
  @Input() file: AudioFileModel;

}
