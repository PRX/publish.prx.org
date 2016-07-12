import {Component, Input} from '@angular/core';
import {FileSizePipe} from '../../shared/file/filesize.pipe';
import {ImageLoaderComponent} from '../../shared/image/image-loader.component';
import {ImageModel} from '../../storyedit/models/image.model';
import {StoryFieldComponent} from '../../storyedit/directives/storyfield.component';

@Component({
  directives: [ImageLoaderComponent, StoryFieldComponent],
  pipes: [FileSizePipe],
  selector: 'image-file',
  styleUrls: ['app/upload/directives/image-file.component.css'],
  template: `
    <div *ngIf="!image.isDestroy" class="image-file" [class.canceled]="canceled">

      <div class="thumbnail" [class.changed]="image.isNew">
        <div *ngIf="image.isUploading" class="uploading">
          <p *ngIf="!canceled">Uploading</p>
          <p *ngIf="canceled">Upload Canceled</p>
          <div class="meter">
            <span [style.width.%]="image.progress * 100"></span>
          </div>
        </div>
        <image-loader *ngIf="!image.isUploading" [src]="image.enclosureHref">
        </image-loader>
        <div class="cancel">
          <i *ngIf="!canceled" class="icon-cancel" (click)="onCancel($event)"></i>
        </div>
      </div>

      <div class="info" *ngIf="!canceled">
        <h3>{{image?.filename}} {{image?.isNew}}</h3>
        <story-field [story]="image" textinput="true" name="caption" label="Caption" small="true"></story-field>
        <story-field [story]="image" textinput="true" name="credit" label="Credit" small="true"></story-field>
      </div>

    </div>
  `
})

export class ImageFileComponent {

  canceled: boolean;

  @Input() image: ImageModel;

  onCancel(event: Event) {
    event.preventDefault();

    // wait for fade-out before parent removes this component
    this.canceled = true;
    setTimeout(() => { this.image.destroy(); this.canceled = false; }, 1000);
  }

  onRetry(event: Event) {
    event.preventDefault();
    if (this.image.isUploading) {
      this.image.retryUpload();
    } else {
      alert('TODO: retry non-uploader failure');
    }
  }

}
