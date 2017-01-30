import { Component, Input } from '@angular/core';
import { AudioVersionTemplateModel, AudioFileTemplateModel } from '../../shared';

@Component({
  selector: 'publish-file-template',
  styleUrls: ['file-template.component.css'],
  template: `
    <div *ngIf="file && !file.isDestroy" class="file">

      <div class="main">
        <div class="label">
          <publish-fancy-field textinput required hideinvalid [model]="file" name="label">
          </publish-fancy-field>
        </div>
        <div class="lengths">
          <publish-fancy-duration [model]="file" tiny="true" name="lengthMinimum" label="Min"></publish-fancy-duration>
          <publish-fancy-duration [model]="file" tiny="true" name="lengthMaximum" label="Max"></publish-fancy-duration>
        </div>
      </div>

      <div class="remove">
        <button *ngIf="canRemoveFile" type="button" class="btn-icon icon-cancel" (click)="removeFile()"></button>
      </div>

      <p *ngIf="invalid" class="error">{{invalid | capitalize}}</p>

    </div>
  `
})

export class FileTemplateComponent {

  @Input() version: AudioVersionTemplateModel;
  @Input() file: AudioFileTemplateModel;

  get invalid(): string {
    return this.file.invalid('label') || this.file.invalid('lengthAny');
  }

  get canRemoveFile(): boolean {
    if (this.version && this.file) {
      let last = this.version.fileTemplates.filter(f => !f.isDestroy).pop();
      return this.file === last;
    }
  }

  removeFile() {
    this.file.isDestroy = true;
    if (this.file.isNew) {
      this.version.removeRelated(this.file);
      this.file.unstore();
    }
  }

}
