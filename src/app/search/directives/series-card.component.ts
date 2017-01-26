import { Component, Input, OnInit } from '@angular/core';
import { SeriesModel } from '../../shared';

@Component({
  selector: 'publish-series-card',
  styleUrls: ['series-card.component.css'],
  template: `
    <section class="series-image">
      <a [routerLink]="seriesLink"><publish-image [imageDoc]="series.doc"></publish-image></a>
      <div class="stack stk-one"></div>
      <div class="stack stk-two"></div>
      <div class="stack stk-three"></div>
    </section>
    <section>
      <h2 class="series-title"><a [routerLink]="seriesLink">{{seriesTitle}}</a></h2>
      <p class="series-info">
        <span class="episode-count">{{seriesEpisodeCount}} Ep.</span>
        <span class="updated-at">Updated {{seriesUpdatedAt | date:"MM/dd/yy"}}</span>
      </p>
    </section>
    <section class="series-detail">
      <publish-text-overflow-fade class="series-description" numLines="8" lineHeight="20" unit="px">
        {{seriesDescription}}
      </publish-text-overflow-fade>
    </section>
  `
})

export class SeriesCardComponent implements OnInit {

  @Input() series: SeriesModel;

  seriesLink: any[];

  seriesId: number;
  seriesTitle: string;
  seriesEpisodeCount: number;
  seriesUpdatedAt: Date;
  seriesDescription: string;

  ngOnInit() {
    this.seriesId = this.series.id;
    this.seriesTitle = this.series.title;
    this.seriesEpisodeCount = this.series.doc.count('prx:stories') || 0;
    this.seriesUpdatedAt = this.series.updatedAt;
    this.seriesDescription = this.series.shortDescription;
    this.seriesLink = ['/series', this.series.id];
  }
}
