import { Component, Input } from '@angular/core';

@Component({
  selector: 'publish-text-overflow-ellipses',
  template: `
    <div [style.max-height]="(numLines * lineHeight) + unit" [style.line-height]="lineHeight + unit">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['text-overflow-ellipses.component.css']
})

export class TextOverflowEllipsesComponent {
  @Input() numLines = 3;
  @Input() lineHeight = 1.2;
  @Input() unit = 'em';
}
