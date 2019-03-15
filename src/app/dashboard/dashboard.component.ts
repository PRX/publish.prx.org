import { Component, OnInit } from '@angular/core';
import { CmsService, HalDoc } from '../core';

@Component({
  selector: 'publish-dashboard',
  styleUrls: ['dashboard.component.css'],
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent implements OnInit {

  isLoaded = false;
  totalCount: number;
  noSeries: boolean;
  auth: HalDoc;
  series: HalDoc[];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.isLoaded = false;
    this.cms.auth.subscribe(auth => {
      this.auth = auth;

      // only load v4 series
      auth.followItems('prx:series', {filters: 'v4', zoom: 'prx:image'}).subscribe(series => {
        this.isLoaded = true;
        this.totalCount = series.length ? series[0].total() : 0;
        this.noSeries = (series.length < 1) ? true : null;
        this.series = series;
      });
    });
  }

}
