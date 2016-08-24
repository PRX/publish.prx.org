import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[fileSelect]'
})
export class FileSelectDirective {

  @Output() file = new EventEmitter();

  constructor(private element: ElementRef) {}

  @HostListener('change') onChange(): void {
    for (let file of this.getFiles()) {
      this.file.emit(file);
    }
  }

  getFiles(): any[] {
    return this.element.nativeElement.files;
  }

}
