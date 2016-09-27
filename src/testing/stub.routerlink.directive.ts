/* tslint:disable */
import { Directive, Input, OnInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[routerLink]',
  host: {
    '(click)': 'onClick()'
  }
})
export class StubRouterLinkDirective implements OnInit {

  @Input('routerLink') linkParams: any;
  @Input('routerLinkActiveOptions') linkOptions: any;

  navigatedTo: any = null;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.setAttribute('href', this.linkParams);
  }

  onClick() {
    this.navigatedTo = this.linkParams;
  }

}
