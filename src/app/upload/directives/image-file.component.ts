import { Component, Input } from '@angular/core';
import { ImageModel } from '../../shared';

@Component({
  selector: 'image-file',
  styleUrls: ['image-file.component.css'],
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
        <fancy-field [model]="image" textinput="true" name="caption" label="Caption" small="true"></fancy-field>
        <fancy-field [model]="image" textinput="true" name="credit" label="Credit" small="true"></fancy-field>
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
