import { Component, Input, ElementRef, OnChanges } from '@angular/core';
import { HalDoc } from '../cms/haldoc';

@Component({
  selector: 'image-loader',
  styleUrls: ['image-loader.component.css'],
  template: `
    <img *ngIf="src" [src]="src" (load)="onLoad()" (error)="onError()"/>
    `
})

export class ImageLoaderComponent implements OnChanges {

  @Input() public src: string;
  @Input() public imageDoc: HalDoc;

  static PLACEHOLDER_IMAGE: string = '/assets/images/placeholder.png';
  static PLACEHOLDER_ERROR: string = '/assets/images/placeholder_error.png';

  constructor(private element: ElementRef) {}

  setBackgroundImage(src) {
    this.element.nativeElement.style['background-image'] = `url(${src})`;
  }

  onLoad = () => this.setBackgroundImage(this.src);

  onError = () => this.setBackgroundImage(ImageLoaderComponent.PLACEHOLDER_ERROR);

  ngOnChanges(changes:any) {
    const doesntHaveSrc = (changes) => !changes.src || !changes.src.currentValue;
    const hasPRXImageDoc = (changes) => changes.imageDoc && changes.imageDoc.currentValue && changes.imageDoc.currentValue.has('prx:image');

    if (doesntHaveSrc(changes)) {
      if (hasPRXImageDoc(changes)) {
        this.imageDoc.follow('prx:image').subscribe(
          img => this.src = img.expand('enclosure'),
          err => this.src = ImageLoaderComponent.PLACEHOLDER_ERROR
        );
      } else {
        this.src = ImageLoaderComponent.PLACEHOLDER_IMAGE;
      }
    }
  }

}
