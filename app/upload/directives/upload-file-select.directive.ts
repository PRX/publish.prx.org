import {Directive, ElementRef, Output, EventEmitter} from 'angular2/core';

@Directive({
  selector: '[upload-file]',
  host: { '(change)': 'onChange()' }
})
export class UploadFileSelect {

  @Output() file = new EventEmitter();

  constructor(private element: ElementRef) {}

  onChange(): void {
    let files = this.element.nativeElement.files;
    for (let file of files) {
      this.file.emit(file);
    }
  }
}
