import {Directive, ElementRef, Input} from 'angular2/core';
import {UploadService} from '../services/upload.service';

@Directive({
  selector: '[upload-file]',
  host: { '(change)': 'onChange()' }
})
export class UploadFileSelect {

  @Input() storyId: number;

  constructor(
    private element: ElementRef,
    private uploadService: UploadService
  ) {}

  onChange(): void {
    let files = this.element.nativeElement.files;
    for (let file of files) {
      this.uploadService.addFile(this.storyId, file);
    }
  }
}
