import { Directive, ElementRef, HostListener, HostBinding, Input, Renderer } from '@angular/core';

@Directive({
   selector: '[publishHoverTip]'
 })

export class HoverDirective {

  @Input() publishHoverTip: string;
  @HostBinding('class.hover-tip') true;

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) {  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hasTip()) { this.showTip(this.publishHoverTip); }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.hasTip()) { this.removeTip(); }
  }

  private showTip(text: string) {
    let tipField = this.firstChild();
    this.renderer.createText(tipField, text);
    this.renderer.setElementClass(tipField, 'displayed', true);
  }

  private removeTip() {
    let tipField = this.firstChild();
    this.renderer.setText(tipField, '');
    this.renderer.setElementClass(tipField, 'displayed', false);
  }

  private firstChild() {
    return this.el.nativeElement.children[0];
  }

  private hasTip () {
    return typeof this.publishHoverTip !== 'undefined';
  }
}
