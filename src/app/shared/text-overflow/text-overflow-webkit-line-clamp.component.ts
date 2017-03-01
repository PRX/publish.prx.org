import { Component, Input } from '@angular/core';

@Component({
  selector: 'publish-text-overflow-webkit-line-clamp',
  template: `
    <div [style.max-height]="(numLines * lineHeight) + unit"
      [style.line-height]="lineHeight + unit"
      [style.-webkit-line-clamp]="numLines">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['text-overflow-webkit-line-clamp.component.css']
})

export class TextOverflowWebkitLineClampComponent {
  @Input() numLines = 3;
  @Input() lineHeight = 1.2;
  @Input() unit = 'em';
}
