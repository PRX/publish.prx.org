import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { CmsService, HalDoc, SpinnerComponent } from '../shared';
import { HomeSeriesComponent } from './directives/home-series.component';

@Component({
  directives: [ROUTER_DIRECTIVES, SpinnerComponent, HomeSeriesComponent],
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
    this.cms.follow('prx:authorization').subscribe(auth => {
      this.auth = auth;

      // only load v4 series
      auth.followItems('prx:series', {filters: 'v4'}).subscribe(series => {
        this.isLoaded = true;
        this.totalCount = series.length ? series[0].total() : 0;
        this.noSeries = (series.length < 1) ? true : null;
        this.oneSeries = (series.length === 1) ? series[0] : null;
        this.manySeries = (series.length > 1) ? series : null;
      });
    });
  }

}
