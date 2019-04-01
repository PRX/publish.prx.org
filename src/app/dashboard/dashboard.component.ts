import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
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
  defaultAccount: HalDoc;
  series: SeriesModel[];

  constructor(private cms: CmsService) {}

  ngOnInit() {
    let seriesDocs: HalDoc[];

    this.cms.auth.pipe(
      mergeMap((auth: HalDoc) => {
        this.auth = auth;
        return auth.follow('prx:default-account');
      }),
      mergeMap((defaultAccount: HalDoc) => {
        this.defaultAccount = defaultAccount;
        return this.auth.followItems('prx:series', {filters: 'v4', zoom: 'prx:image'});
      }),
      mergeMap((series: HalDoc[]) => {
        seriesDocs = series;
        this.totalCount = series.length ? series[0].total() : 0;
        this.noSeries = (series.length < 1) ? true : null;
        return series.map(s => s.follow('prx:account'));
      }),
      mergeMap((account: Observable<HalDoc>) => {
        return account;
      })
    ).subscribe((account: HalDoc) => {
      this.isLoaded = true;
      this.series = seriesDocs.map(s => new SeriesModel(account, s));
    });
  }

}
