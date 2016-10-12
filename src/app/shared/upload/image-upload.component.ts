import { Component, Input } from '@angular/core';
import { UploadService } from '../../core';
import { ImageModel, StoryModel, SeriesModel } from '../model';

@Component({
  selector: 'publish-image-upload',
  styleUrls: ['image-upload.component.css'],
  template: `
    <publish-spinner *ngIf="model && !model?.images"></publish-spinner>

    <div *ngIf="noImages" class="new-image">
      <p class="size">{{recommendWidth}}x{{recommendHeight}} px</p>
      <input type="file" id="file" publishFileSelect (file)="addUpload($event)"/>
      <label class="button" for="file">Add Image</label>
    </div>

    <div *ngIf="model && model.images">
      <publish-image-file *ngFor="let i of model.images" [image]="i"></publish-image-file>
    </div>
  `
})
export class ImageUploadComponent {

  @Input() model: StoryModel|SeriesModel;

  recommendWidth = 200;
  recommendHeight = 200;

  constructor(private uploadService: UploadService) {}

  get noImages(): boolean {
    if (this.model && this.model.images) {
      this.model.images = this.model.images.filter(img => !(img.isNew && img.isDestroy));
      if (this.model.images.length === 0) {
        return true;
      } else if (this.model.images.every(img => img.isDestroy)) {
        return true;
      }
    }
    return false;
  }

  addUpload(file: File) {
    let upload = this.uploadService.add(file);
    this.model.images.push(new ImageModel(this.model.parent, this.model.doc, upload));
  }
}
