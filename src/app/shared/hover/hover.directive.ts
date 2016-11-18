import { Directive, ElementRef, HostListener, Input, Renderer } from '@angular/core';

@Directive({
   selector: '[hover-tip]'
 })

export class HoverDirective {

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) { }

  @Input('hover-tip') tipText: string;

  @HostListener('mouseenter') onMouseEnter() {
    this.showTip(this.tipText || "");
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeText();
  }

  private showTip(text: string) {
    this.renderer.createText(this.firstChild(), text);
  }

  private removeText() {
    this.renderer.setText(this.firstChild(), "");
  }

  private firstChild() {
    return this.el.nativeElement.children[0];
  }
}
