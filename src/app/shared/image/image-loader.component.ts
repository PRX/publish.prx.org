import { Component, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'image-loader',
  styleUrls: ['image-loader.component.css'],
  template: `
    <img *ngIf="src" [src]="src" class="loading" (load)="onLoad()"/>
    `
})

export class ImageLoaderComponent {

  @Input() public src: string;

  constructor(private element: ElementRef) {}

  onLoad() {
    this.element.nativeElement.style['background-image'] = `url(${this.src})`;
  }

}
