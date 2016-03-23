import {Component, Input, ElementRef} from 'angular2/core';

@Component({
  selector: 'image-loader',
  styleUrls: ['app/shared/image/image-loader.component.css'],
  template: `
    <img [src]="src" class="loading" (load)="onLoad()"/>
    `
})

export class ImageLoaderComponent {

  @Input() public src: string;

  constructor(private element: ElementRef) {}

  onLoad() {
    this.element.nativeElement.style['background-image'] = `url(${this.src})`;
  }

}
