import { Directive, ElementRef, HostListener, Input, Renderer } from '@angular/core';

@Directive({
   selector: '[hover-tip]'
 })

export class HoverDirective {

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) {  }

  @Input('hover-tip') tipText: string;

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hasTip()) this.showTip(this.tipText);
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.hasTip()) this.removeTip();
  }

  private showTip(text: string) {
    let tipField = this.firstChild();
    this.renderer.createText(tipField, text);
    this.renderer.setElementClass(tipField, 'displayed', true);
  }

  private removeTip() {
    let tipField = this.firstChild();
    this.renderer.setText(tipField, "");
    this.renderer.setElementClass(tipField, 'displayed', false);
  }

  private firstChild() {
    return this.el.nativeElement.children[0];
  }

  private hasTip () {
    return typeof this.tipText !== "undefined";
  }
}
