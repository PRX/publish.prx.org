import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'publish-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <div #refHero class="hero banner" [class.orange]="orange" [class.blue]="blue">
      <section>
        <ng-content select=".hero-title"></ng-content>
      </section>
    </div>
    <div class="hero toolbar" [class.affix]="affixed" (window:scroll)="onScroll()">
      <section>
        <div class="info" #refInfo><ng-content select=".hero-info"></ng-content></div>
        <prx-spinner *ngIf="refInfo.children.length == 0" inverse=true></prx-spinner>
        <div class="actions" #refActions><ng-content select=".hero-actions"></ng-content></div>
      </section>
    </div>
    <div class="spacer" [class.affix]="affixed"></div>
    `
})

export class HeroComponent implements OnInit {

  @Input() loading = false;
  @Input() orange = false;
  @Input() blue = false;

  @ViewChild('refHero') heroEl: ElementRef;

  affixedY: number;
  affixed = false;

  ngOnInit() {
    this.affixedY = this.heroEl.nativeElement.offsetHeight;
  }

  onScroll() {
    this.affixed = (this.getScrollY() > this.affixedY);
  }

  getScrollY() {
    return window.scrollY;
  }

}
