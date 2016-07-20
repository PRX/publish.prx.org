import {Component, Input} from '@angular/core';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {ImageFileComponent} from './directives/image-file.component';
import {StoryModel} from '../storyedit/models/story.model';
import {ImageModel} from '../storyedit/models/image.model';
import {UploadService} from './services/upload.service';
import {UploadFileSelect} from './directives/upload-file-select.directive';

@Component({
  directives: [SpinnerComponent, ImageFileComponent, UploadFileSelect],
  selector: 'image-uploader',
  styleUrls: ['app/upload/image-upload.component.css'],
  template: `
    <spinner *ngIf="story && !story?.images"></spinner>

    <div *ngIf="noImages" class="new-image">
      <p class="size">{{recommendWidth}}x{{recommendHeight}} px</p>
      <input type="file" id="file" upload-file (file)="addUpload($event)"/>
      <label class="button" for="file">Add Image</label>
    </div>

    <div *ngIf="story && story.images">
      <image-file *ngFor="let i of story.images" [image]="i"></image-file>
    </div>
  `
})
export class ImageUploadComponent {

  @Input() story: StoryModel;

  recommendWidth = 200;
  recommendHeight = 200;

  constructor(private uploadService: UploadService) {}

  get noImages(): boolean {
    if (this.story && this.story.images) {
      this.story.images = this.story.images.filter(img => !(img.isNew && img.isDestroy));
      if (this.story.images.length === 0) {
        return true;
      } else if (this.story.images.every(img => img.isDestroy)) {
        return true;
      }
    }
    return false;
  }

  addUpload(file: File) {
    let upload = this.uploadService.add(file);
    this.story.images.push(new ImageModel(this.story.parent, this.story.doc, upload));
  }
}
