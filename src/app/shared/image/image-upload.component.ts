import { Component, Input, DoCheck } from '@angular/core';
import { StoryModel, SeriesModel, ImageModel } from '../model';
import { UploadService } from 'ngx-prx-styleguide';
import { Env } from 'app/core/core.env';

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
        prxFileSelect (file)="addUpload($event)" class.invalid="imgError"/>
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
  @Input() maxWidth: number;
  @Input() maxHeight: number;
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

  constructor(private uploadService: UploadService) {
    uploadService.createWithConfig({
      awsUrl: `https://${Env.UPLOAD_S3_ENDPOINT_DOMAIN}`,
      bucketName: Env.UPLOAD_BUCKET_NAME,
      bucketFolder: Env.UPLOAD_BUCKET_FOLDER,
      signUrl: Env.UPLOAD_SIGNING_SERVICE_URL,
      awsKey: Env.UPLOAD_SIGNING_SERVICE_KEY_ID
    });
  }

  // avoid dom changes - don't touch the images array until necessary
  ngDoCheck() {
    if (!this.model || !this.model.images) {
      return;
    }

    const hash = this.model.images.map(i => `${i.key}${i.purpose}${i.isDestroy}${i.isNew}`).join('');
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
        if (this.fileDimensionsAcceptable(this.browserImage.width, this.browserImage.height)) {
          this.uploadService.add(file).subscribe(upload => {
            const imageModel = this.model.addImage(upload);
            if (this.purpose) {
              imageModel.set('purpose', this.purpose);
            }
          });
        }
      };
      this.browserImage.src = this.reader.result;
    };

    this.reader.readAsDataURL(file);
  }

  fileDimensionsAcceptable(width: number, height: number): boolean {
    if (!this.suggestSize) {
      if (width < this.minWidth || height < this.minHeight) {
        this.imgError = `The image provided is only ${width} x ${height} px
                         but should be at least ${this.minWidth} x ${this.minHeight} px.`;
        return false;
      } else if ((this.maxWidth && width > this.maxWidth) || (this.maxHeight && height > this.maxHeight)) {
        this.imgError = `The image provided is ${width} x ${height} px
                         but should not exceed ${this.maxWidth} x ${this.maxHeight} px.`;
        return false;
      } else if (this.square && width !== height) {
        this.imgError = `Image width and height must be the same, but the image provided is
                         ${width} x ${height} px.`;
        return false;
      }
    }
    return true;
  }
  // for backwards compatibility, try to set something as the 'profile' image
  setSomethingAsProfile(images: ImageModel[]) {
    const allBlank = images.every(i => i.purpose === '');
    if (this.purpose === 'profile' && images.length && allBlank) {
      // timeout to comply with change detection
      setTimeout(() => {
        images[0].set('purpose', 'profile');
      }, 10);
    }
  }

}
