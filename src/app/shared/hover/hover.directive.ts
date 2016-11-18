import { Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({ selector: '[hover-tip]'})
export class HoverDirective {
  constructor(el: ElementRef, renderer: Renderer) {
    renderer.setElementStyle(el.nativeElement, 'backgroundColor', 'yellow');
  }
}
