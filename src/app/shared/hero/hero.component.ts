import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'publish-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <div #refHero class="hero banner" [class.orange]="orange" [class.blue]="blue">
      <section>
        <ng-content select="hero-title"></ng-content>
      </section>
    </div>
    <div class="hero toolbar" [class.affix]="affixed" (window:scroll)="onScroll()">
      <section>
        <div class="info" #refInfo><ng-content select="hero-info"></ng-content></div>
        <publish-spinner *ngIf="refInfo.children.length == 0" inverse=true></publish-spinner>
        <div class="actions" #refActions><ng-content select="hero-actions"></ng-content></div>
      </section>
    </div>
    <div class="spacer" [class.affix]="affixed"></div>
    `
})

export class HeroComponent implements OnInit {

  @Input() loading: boolean = false;
  @Input() orange: boolean = false;
  @Input() blue: boolean = false;

  @ViewChild('refHero') heroEl: ElementRef;

  affixedY: number;
  affixed = false;

  ngOnInit() {
    this.affixedY = this.heroEl.nativeElement.offsetHeight;
  }

  onScroll() {
    this.affixed = (window.scrollY > this.affixedY);
  }

}
