import { Component, Input } from '@angular/core';
import { ModalService } from 'ngx-prx-styleguide';
import { AudioFileTemplateModel, AudioVersionTemplateModel } from 'ngx-prx-styleguide';

@Component({
  selector: 'publish-file-template',
  styleUrls: ['file-template.component.css'],
  template: `
    <div *ngIf="file && !file.isDestroy" class="file">

      <div class="main">
        <div class="label">
          <prx-fancy-field textinput required hideinvalid [model]="file" name="label">
          </prx-fancy-field>
        </div>
        <div class="lengths">
          <prx-fancy-duration [model]="file" tiny="true" name="lengthMinimum" label="Min"
            [advancedConfirm]="lengthConfirm(file['lengthMinimum'] | duration, 'minimum')"></prx-fancy-duration>
          <prx-fancy-duration [model]="file" tiny="true" name="lengthMaximum" label="Max"
            [advancedConfirm]="lengthConfirm(file['lengthMaximum'] | duration, 'maximum')"></prx-fancy-duration>
        </div>
      </div>

      <div class="remove">
        <button *ngIf="canRemoveFile" type="button" class="btn-icon icon-cancel" (click)="confirmRemoveFile()"></button>
      </div>

      <p *ngIf="invalid" class="error">{{invalid | capitalize}}</p>

    </div>
  `
})

export class FileTemplateComponent {

  @Input() version: AudioVersionTemplateModel;
  @Input() file: AudioFileTemplateModel;

  constructor(private modal: ModalService) {}

  hasStories() {
    return this.version && this.version.parent && this.version.parent.has('prx:stories') && this.version.parent.count('prx:stories') > 0;
  }

  get invalid(): string {
    return this.file.invalid('label') || this.file.invalid('lengthAny');
  }

  get canRemoveFile(): boolean {
    if (this.version && this.file) {
      let last = this.version.fileTemplates.filter(f => !f.isDestroy).pop();
      return this.file === last;
    }
  }

  confirmRemoveFile() {
    if (this.hasStories() && !this.file.isNew) {
      let confirmMsg = `Are you sure you want to remove the ${this.file.label} segment?
      This change could affect your already published episodes.`;
      this.modal.confirm('', confirmMsg, (confirm) => {
        if (confirm) {
          this.removeFile();
        }
      });
    } else {
      this.removeFile();
    }
  }

  removeFile() {
    this.file.isDestroy = true;
    if (this.file.isNew) {
      this.version.removeRelated(this.file);
      this.file.unstore();
    }
  }

  isLengthMoreStrict() {
    return (this.file.lengthMinimum > this.file.original['lengthMinimum'] ||
    (this.file.lengthMaximum !== 0 && this.file.lengthMaximum < this.file.original['lengthMaximum']));
  }

  lengthConfirm(value: string, label: string): string {
    if (this.hasStories() && this.isLengthMoreStrict()) {
      return `Are you sure you want to use ${value} as the ${label} length for the ${this.file.label} segment?
        This change could invalidate your already published episodes.`;
    }
  }

}
