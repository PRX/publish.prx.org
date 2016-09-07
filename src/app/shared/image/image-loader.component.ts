import { Component, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'image-loader',
  styleUrls: ['image-loader.component.css'],
  template: `
    <img *ngIf="src" [src]="src" class="loading" (load)="setBackgroundImage(src)" (error)="setBackgroundImage(placeholderError)"/>
    <img *ngIf="!src" [src]="placeholderImage" class="loading" (load)="setBackgroundImage(placeholderImage)" (error)="setBackgroundImage(placeholderError)"/>
    `
})

export class ImageLoaderComponent {

  @Input() public src: string;

  placeholderImage: string = '/assets/images/placeholder.png';
  placeholderError: string = '/assets/images/placeholder_error.png';

  constructor(private element: ElementRef) {}

  setBackgroundImage(src) {
    this.element.nativeElement.style['background-image'] = `url(${src})`;
  }

}
