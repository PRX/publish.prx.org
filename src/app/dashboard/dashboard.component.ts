import { Component, OnInit } from '@angular/core';
import { CmsService, HalDoc } from '../core';
import { SeriesModel } from '../shared';

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
  account: HalDoc;
  series: SeriesModel[];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.isLoaded = false;
    this.cms.auth.subscribe(auth => {
      this.auth = auth;
      // only load v4 series
      auth.follow('prx:default-account').subscribe((account: HalDoc) => {
        this.account = account;
        auth.followItems('prx:series', {filters: 'v4', zoom: 'prx:image'}).subscribe(series => {
          this.isLoaded = true;
          this.totalCount = series.length ? series[0].total() : 0;
          this.noSeries = (series.length < 1) ? true : null;
          this.series = series.map(s => new SeriesModel(auth, s));
        });
      });
    });
  }

}
