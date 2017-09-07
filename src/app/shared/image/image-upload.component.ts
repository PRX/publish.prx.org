import { Component, Input, DoCheck } from '@angular/core';
import { UploadService } from '../../core';
import { StoryModel, SeriesModel, ImageModel } from '../model';

@Component({
  selector: 'publish-image-upload',
  styleUrls: ['image-upload.component.css'],
  template: `
    <prx-spinner *ngIf="!images"></prx-spinner>

    <div *ngIf="!hasImages" class="new-image" [class.changed]="hasDestroyed"
      [style.width]="thumbnailWidth" [style.height]="thumbnailHeight">

      <div class="size">
        <p *ngIf="!suggestSize">
          Minimum size: {{minWidth}} x {{minHeight}} px
          Maximum size: {{maxWidth}} x {{maxHeight}} px
        </p>
        <p *ngIf="suggestSize">Suggested size: {{suggestSize}} px</p>
      </div>
      <input type="file" [attr.id]="'image-file-' + purpose" accept="image/*"
       publishFileSelect (file)="addUpload($event)" class.invalid="imgError"/>
      <label class="button" [attr.for]="'image-file-' + purpose">Add Image</label>

    </div>

    <p *ngIf="imgError" class="error">{{imgError}}</p>

    <div *ngIf="hasImages">
      <publish-image-file *ngFor="let i of images" [model]="model" [image]="i"
        [thumbnailWidth]="thumbnailWidth" [thumbnailHeight]="thumbnailHeight"></publish-image-file>
    </div>
  `
})
export class ImageUploadComponent implements DoCheck {

  @Input() model: StoryModel|SeriesModel;
  @Input() purpose: string;
  @Input() minWidth = 144;
  @Input() minHeight = 144;
  @Input() maxWidth = 144;
  @Input() maxHeight = 144;
  @Input() suggestSize: string;
  @Input() square = false;

  // TODO: move size validations to model, to prevent saving an invalid image
  @Input() strict: boolean;

  thumbnailHeight = '220px';
  imgError: string;
  reader: FileReader = new FileReader();
  browserImage: any;

  lastImageHash: string;
  images: ImageModel[];
  hasImages = false;
  hasDestroyed = false;

  constructor(private uploadService: UploadService) {}

  // avoid dom changes - don't touch the images array until necessary
  ngDoCheck() {
    if (!this.model || !this.model.images) {
      return;
    }

    let hash = this.model.images.map(i => `${i.key}${i.purpose}${i.isDestroy}${i.isNew}`).join('');
    if (this.lastImageHash !== hash) {
      this.lastImageHash = hash;

      // force set a profile
      this.setSomethingAsProfile(this.model.images);
      this.images = this.model.images.filter(img => {
        return !this.purpose || img.purpose === this.purpose;
      });
      this.hasImages = this.images.some(i => !i.isDestroy);
      this.hasDestroyed = this.images.some(i => i.isDestroy && !i.isNew);
    }
  }

  get thumbnailWidth(): string {
    let width = '220px';
    if (this.minWidth !== this.minHeight) {
      width = `${220 * this.minWidth / this.minHeight}px`;
    }
    return width;
  }

  addUpload(file: File) {
    if ( !this.uploadService.validFileType(file, ['jpeg', 'png']) ) {
      this.imgError = 'The file provided is in an unacceptable format. Please upload a file of type JPEG or PNG.';
      return;
    }

    this.reader.onloadstart = () => {
      this.imgError = '';
    };

    this.reader.onerror = () => {
      this.imgError = 'Error uploading image';
    };

    this.reader.onloadend = () => {
      this.browserImage = new Image();
      this.browserImage.onload = () => {
        if (this.browserImage.width < this.minWidth || this.browserImage.height < this.minHeight) {
          this.imgError = `The image provided is only ${this.browserImage.width} x ${this.browserImage.height} px
                           but should be at least ${this.minWidth} x ${this.minHeight} px.`;
        } else if (this.browserImage.width > this.maxWidth || this.browserImage.height > this.maxHeight){
          this.imgError = `The image provided is ${this.browserImage.width} x ${this.browserImage.height} px
                           but should not exceed ${this.maxWidth} x ${this.maxHeight} px.`;
        } else if (this.square && this.browserImage.width !== this.browserImage.height) {
          this.imgError = `Image width and height must be the same, but the image provided is
                           ${this.browserImage.width} x ${this.browserImage.height} px.`;
        } else {
          let upload = this.uploadService.add(file);
          let imageModel = this.model.addImage(upload);
          if (this.purpose) {
            imageModel.set('purpose', this.purpose);
          }
        }
      };
      this.browserImage.src = this.reader.result;
    };

    this.reader.readAsDataURL(file);
  }

  // for backwards compatibility, try to set something as the 'profile' image
  setSomethingAsProfile(images: ImageModel[]) {
    let allBlank = images.every(i => i.purpose === '');
    if (this.purpose === 'profile' && images.length && allBlank) {
      // timeout to comply with change detection
      setTimeout(() => {
        images[0].set('purpose', 'profile');
      }, 10);
    }
  }

}
