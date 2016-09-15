import { Component, Input} from '@angular/core';

@Component({
  selector: 'overflow',
  styleUrls: ['overflow.component.css'],
  template: `
    <p class="overflow-area">
      {{overflowText}}
    </p>
  `
})

export class OverflowComponent {

  @Input() overflowText: string;
}
