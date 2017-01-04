import { Component, Input } from '@angular/core';

@Component({
  selector: 'publish-text-overflow-fade',
  template: `
    <div [style.max-height]="(numLines * lineHeight) + unit" [style.line-height]="lineHeight + unit">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['text-overflow-fade.component.css']
})

export class TextOverflowFadeComponent {
  @Input() numLines: number = 3;
  @Input() lineHeight: number = 1.2;
  @Input() unit: string = 'em';
}
