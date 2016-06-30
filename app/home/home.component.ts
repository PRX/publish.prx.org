import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {CmsService} from '../shared/cms/cms.service';
import {HalDoc} from '../shared/cms/haldoc';
import {HomeSeriesComponent} from './directives/home-series.component';

@Component({
  directives: [SpinnerComponent, HomeSeriesComponent, ROUTER_DIRECTIVES],
  selector: 'publish-home',
  styleUrls: ['app/home/home.component.css'],
  template: `
    <div class="main">
      <section>
        <header>
          <h2>Your Series</h2>
          <a *ngIf="totalCount" class="all" href="#">View All {{totalCount}} &raquo;</a>
        </header>
        <spinner *ngIf="!isLoaded"></spinner>
        <div *ngIf="noSeries">
          <h1>No Series</h1>
          <home-series noseries=true [auth]="auth" rows=4></home-series>
        </div>
        <div *ngIf="oneSeries">
          <home-series [series]="oneSeries" rows=4></home-series>
          <home-series noseries=true [auth]="auth" rows=4></home-series>
        </div>
        <div *ngIf="manySeries">
          <home-series *ngFor="let s of manySeries" [series]="s" rows=2></home-series>
          <home-series noseries=true [auth]="auth" rows=2></home-series>
        </div>
      </section>
    </div>
    `
})

export class HomeComponent {

  isLoaded = false;
  totalCount: number;
  noSeries: boolean;
  auth: HalDoc;
  oneSeries: HalDoc;
  manySeries: HalDoc[];

  constructor(private cms: CmsService) {
    cms.follow('prx:authorization').subscribe((auth) => {
      this.auth = auth;
      if (auth.count('prx:series') < 1) {
        this.noSeries = true;
        this.isLoaded = true;
      } else if (auth.count('prx:series') === 1) {
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
