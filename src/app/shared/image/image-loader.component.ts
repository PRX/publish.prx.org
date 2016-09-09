import { Component, Input, ElementRef } from '@angular/core';
import { HalDoc } from '../cms/haldoc';

@Component({
  selector: 'image-loader',
  styleUrls: ['image-loader.component.css'],
  template: `
    <img *ngIf="src" [src]="src" (load)="onLoad()" (error)="onError()"/>
    `
})

export class ImageLoaderComponent {

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
    if ((!changes.src || !changes.src.currentValue) &&
        changes.imageDoc && changes.imageDoc.currentValue && changes.imageDoc.currentValue.has('prx:image')) {
      this.imageDoc.follow('prx:image').subscribe(
        img => this.src = img.expand('enclosure'),
        err => this.src = ImageLoaderComponent.PLACEHOLDER_ERROR
      )
    } else if (!changes.src || !changes.src.currentValue) {
      this.src = ImageLoaderComponent.PLACEHOLDER_IMAGE;
    }
  }

}
