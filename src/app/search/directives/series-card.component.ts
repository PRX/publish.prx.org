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
        <span class="updated-at">{{seriesUpdatedAt | date:"MM/dd/yy"}}</span>
      </p>
    </section>
    <section class="series-detail">
      <p class="series-genre">{{GENRE}}</p>
      <p class="series-description">{{seriesDescription}}</p>
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
  seriesGenre: string;
  seriesSubGenre: string;

  ngOnInit() {
    this.seriesId = this.series.id;
    this.seriesTitle = this.series.title;
    this.seriesEpisodeCount = this.series.doc.count('prx:stories') || 0;
    this.seriesUpdatedAt = this.series.updatedAt;

    this.seriesDescription = this.series.shortDescription;
    /* TODO: add support when series has genre and subgenre
    this.seriesGenre = this.series.genre;
    this.seriesSubGenre = this.series.subgenre;*/

    this.seriesLink = ['/series', this.series.id];
  }

  get GENRE(): string {
    return this.seriesSubGenre ? this.seriesGenre + ' - ' + this.seriesSubGenre : this.seriesGenre;
  }
}
