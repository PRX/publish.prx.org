import { Component, Input, ElementRef, OnChanges } from '@angular/core';
import { HalDoc } from '../../core';

@Component({
  selector: 'publish-image',
  styleUrls: ['image-loader.component.css'],
  template: `
    <img *ngIf="src" [src]="src" (load)="onLoad()" (error)="onError()"/>
    `
})

export class ImageLoaderComponent implements OnChanges {

  static PLACEHOLDER_IMAGE = '/assets/images/placeholder.png';
  static PLACEHOLDER_ERROR = '/assets/images/placeholder_error.png';

  @Input() public src: string;
  @Input() public imageDoc: HalDoc;

  constructor(private element: ElementRef) {}

  setBackgroundImage(src) {
    this.element.nativeElement.style['background-image'] = `url(${src})`;
  }

  onLoad = () => this.setBackgroundImage(this.src);

  onError = () => this.setBackgroundImage(ImageLoaderComponent.PLACEHOLDER_ERROR);

  ngOnChanges(changes: any) {
    const doesntHaveSrc = (chg) => !chg.src || !chg.src.currentValue;
    const hasPRXImageDoc = (chg) => chg.imageDoc && chg.imageDoc.currentValue && chg.imageDoc.currentValue.has('prx:image');

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
