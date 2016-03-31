import {Directive, ElementRef, EventEmitter} from 'angular2/core';
import {UploadService} from './upload.service';

@Directive({
  selector: '[upload-file]',
  host: { '(change)': 'onChange()' }
})
export class UploadFileSelect {

  constructor(
    private element:ElementRef,
    private uploadService: UploadService) {
  }

  onChange(): void {
    let files = this.element.nativeElement.files;
    for (let file of files) {
      this.uploadService.addFile(file);
    }
  }
}
