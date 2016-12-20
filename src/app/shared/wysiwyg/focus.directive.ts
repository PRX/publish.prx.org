import {Directive, Input, ElementRef, AfterViewInit} from '@angular/core';

@Directive({
  selector: '[publishFocus]'
})
export class FocusDirective implements AfterViewInit {
  @Input() publishFocus: any;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}
