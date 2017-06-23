import { Component, Input } from '@angular/core';
import { SeriesModel } from '../../shared';

@Component({
  selector: 'publish-series-list',
  styleUrls: ['series-list.component.css'],
  template: `
    <div *ngIf="noSeries">
      <h1>No Series match your search</h1>
    </div>
    <div *ngIf="!noSeries">
      <div class="series-list">
        <publish-series-card *ngFor="let s of series" [series]="s"></publish-series-card>
        <div *ngIf="!isLoaded" class="series-loading"><prx-spinner></prx-spinner></div>
        <div class="empty-series-card"></div>
      </div>
    </div>
`
})

export class SeriesListComponent {
  @Input() noSeries: boolean;
  @Input() series: SeriesModel[];
  @Input() isLoaded: boolean;
}
