import { Component, Input, OnInit } from '@angular/core';
import { SeriesModel } from '../../shared';

@Component({
  selector: 'publish-series-card',
  styleUrls: ['series-card.component.css'],
  template: `
    <section class="series-image">
      <a [routerLink]="seriesLink"><publish-image [imageDoc]="series.doc"></publish-image></a>
    </section>
    <section>
      <h2 class="series-title"><a [routerLink]="seriesLink">{{seriesTitle}}</a></h2>
      <p class="meta">
        <span class="episode-count">{{seriesEpisodeCount}} Ep.</span>
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
  seriesDescription: string;
  seriesGenre: string;
  seriesSubGenre: string;

  ngOnInit() {
    this.seriesId = this.series.id;
    this.seriesTitle = this.series.title;
    this.seriesEpisodeCount = this.series.doc.count('prx:stories') || 0;

    this.seriesDescription = this.series.shortDescription;
    /* TODO: sort out genre/tags, thought Andrew said stories have tags and series have genre
    this.seriesGenre = this.series.genre;
    this.seriesSubGenre = this.series.subgenre;*/

    this.seriesLink = ['/series', this.series.id];
  }

  get GENRE(): string {
    return this.seriesSubGenre ? this.seriesGenre + ' - ' + this.seriesSubGenre : this.seriesGenre;
  }
}
