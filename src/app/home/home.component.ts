import { Component, OnInit } from '@angular/core';
import { CmsService, HalDoc, SpinnerComponent } from '../shared';
import { HomeSeriesComponent } from './directives/home-series.component';

@Component({
  directives: [SpinnerComponent, HomeSeriesComponent],
  selector: 'publish-home',
  styleUrls: ['home.component.css'],
  templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {

  isLoaded = false;
  totalCount: number;
  noSeries: boolean;
  auth: HalDoc;
  oneSeries: HalDoc;
  manySeries: HalDoc[];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.isLoaded = false;
    this.cms.follow('prx:authorization').subscribe((auth) => {
      this.auth = auth;
      let seriesCount = auth.count('prx:series') || 0;
      if (seriesCount < 1) {
        this.noSeries = true;
        this.isLoaded = true;
      } else if (seriesCount === 1) {
        auth.followItems('prx:series').subscribe((series) => {
          this.oneSeries = series[0];
          this.isLoaded = true;
        });
      } else {
        auth.followItems('prx:series').subscribe((series) => {
          this.manySeries = series;
          this.totalCount = auth.count('prx:series');
          this.isLoaded = true;
        });
      }
    });
  }

}
