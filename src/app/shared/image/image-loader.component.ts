import { Component, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'image-loader',
  styleUrls: ['image-loader.component.css'],
  template: `
    <img *ngIf="src" [src]="src" (load)="onLoad()" (error)="onError()"/>
    `
})

export class ImageLoaderComponent {

  @Input() public src: string;

  static PLACEHOLDER_IMAGE: string = '/assets/images/placeholder.png';
  static PLACEHOLDER_ERROR: string = '/assets/images/placeholder_error.png';

  constructor(private element: ElementRef) {}

  setBackgroundImage(src) {
    this.element.nativeElement.style['background-image'] = `url(${src})`;
  }

  onLoad = () => this.setBackgroundImage(this.src);

  onError = () => this.setBackgroundImage(ImageLoaderComponent.PLACEHOLDER_ERROR);

}
