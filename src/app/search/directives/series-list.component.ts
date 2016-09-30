import { Component, Input, OnChanges } from '@angular/core';
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
        <div *ngFor="let i of emptyCards" class="empty-series-card"></div>
        <div *ngFor="let l of loaders" class="series"><publish-spinner></publish-spinner></div>
      </div>
    </div>
`
})

export class SeriesListComponent implements OnChanges {
  @Input() noSeries: boolean;
  @Input() series: SeriesModel[];
  @Input() loaders: boolean[];

  emptyCards: number[];

  ngOnChanges(changes: any) {
    if (changes['series'] && changes['series'].currentValue &&
      changes['series'].currentValue.length > 0 && changes['series'].currentValue.length % 2 > 0) {
      this.emptyCards = Array.from(Array(2 - changes['series'].currentValue.length % 2), (x, i ) => i);
    }
  }
}
