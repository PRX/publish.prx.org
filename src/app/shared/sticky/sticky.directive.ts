import { Directive, ElementRef } from '@angular/core';
import * as Stickyfill from 'stickyfilljs';

@Directive({
  selector: '.sticky-container'
})
export class StickyDirective {

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    Stickyfill.addOne(this.elementRef.nativeElement);
  }

}
