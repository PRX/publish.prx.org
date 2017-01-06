import { Component, Input } from '@angular/core';
import { AudioFileTemplateModel } from '../../shared';

@Component({
  selector: 'publish-file-template',
  styleUrls: ['file-template.component.css'],
  template: `
    <div *ngIf="file && !file.isDestroy">

      <publish-fancy-field textinput small required [model]="file" name="label" label="Segment {{file.position}} Label">
        <span class="fancy-hint">A name for this audio segment, such as "Billboard" or "Part A"</span>
      </publish-fancy-field>

      <publish-fancy-field small class="length" [model]="file" label="Segment length in seconds" invalid="lengthAny">
      <span class="fancy-hint">The minimum and maximum durations in seconds for this segment</span>

        <publish-fancy-field number small inline hideinvalid [model]="file" name="lengthMinimum" label="Minimum">
        </publish-fancy-field>

        <publish-fancy-field number small inline hideinvalid [model]="file" name="lengthMaximum" label="Maximum">
        </publish-fancy-field>

      </publish-fancy-field>

    </div>
  `
})

export class FileTemplateComponent {

  @Input() file: AudioFileTemplateModel;

}
