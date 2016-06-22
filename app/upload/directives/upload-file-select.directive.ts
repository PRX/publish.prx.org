import {Directive, ElementRef, Output, EventEmitter} from '@angular/core';

@Directive({
  selector: '[upload-file]',
  host: { '(change)': 'onChange()' }
})
export class UploadFileSelect {

  @Output() file = new EventEmitter();

  constructor(private element: ElementRef) {}

  onChange(): void {
    for (let file of this.getFiles()) {
      this.file.emit(file);
    }
  }

  getFiles(): any[] {
    return this.element.nativeElement.files;
  }

}
