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
    this.el.nativeElement.setAttribute('href', this.buildLinkParams());
  }

  buildLinkParams(): string {
    let href = this.linkParams;
    if (this.linkParams && this.linkParams instanceof Array) {
      href = this.linkParams[0];
      this.linkParams.forEach((param) => {
        if (param instanceof String) {
          href += '/' + param;
        } else if (param instanceof Object)  {
          Object.keys(param).forEach(key => {
            href += ';' + key + '=' + param[key];
          });
        }
      });
    }
    return href;
  }

  onClick() {
    this.navigatedTo = this.linkParams;
  }

}
