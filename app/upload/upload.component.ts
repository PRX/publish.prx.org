import {Component} from 'angular2/core';
import {UploadFileSelect} from './upload-file-select.directive';
import {UploadService} from './upload.service';
import {MimeTypeService} from '../../util/mime-type.service';
import {FileUpload} from './file-upload.component';

@Component({
  template: `
    <input type="file" upload-file />
    <file-upload *ngFor="#upload of uploadService.uploads" [upload]="upload">
    </file-upload>
  `,
  providers: [UploadService, MimeTypeService],
  directives: [UploadFileSelect, FileUpload]
})

export class UploadComponent {
  constructor(private uploadService:UploadService) {}
}
