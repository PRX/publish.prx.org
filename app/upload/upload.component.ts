import { Component } from 'angular2/core';
import { UploadFileSelect } from './upload-file-select.directive';
import { UploadService } from './upload.service';
import { MimeTypeService } from '../../util/mime-type.service';
import { HTTP_PROVIDERS } from 'angular2/http';

@Component({
  template: '<input type="file" upload-file />',
  providers: [HTTP_PROVIDERS, UploadService, MimeTypeService],
  directives: [UploadFileSelect]
})

export class UploadComponent { }
