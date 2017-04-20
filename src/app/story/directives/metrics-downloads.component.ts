import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { CastleService } from '../../core';
import { StoryModel, TabService } from '../../shared';
import { TimeseriesChartModel, TimeseriesDatumModel } from 'styleguide.prx.org';

@Component({
  template: `
    <div class="params">
      <p>
        <label>From:</label>
        <span>
          <prx-datepicker [date]="beginDate" (dateChange)="beginDateChange($event)"></prx-datepicker>
          <prx-timepicker [date]="beginDate" (timeChange)="beginDateChange($event)"></prx-timepicker>
        </span>
      </p>
      <p>
        <label>Through:</label>
        <span>
          <prx-datepicker [date]="endDate" (dateChange)="endDateChange($event)"></prx-datepicker>
          <prx-timepicker [date]="endDate" (timeChange)="endDateChange($event)"></prx-timepicker>
        </span>
      </p>
      <p>
        <label for="interval">Interval:</label>
        <select id="interval" [ngModel]="interval" (ngModelChange)="intervalChange($event)">
          <option value="15m">15 minutes</option>
          <option value="1h">hourly</option>
          <option value="1d">daily</option>
        </select>
      </p>
    </div>
    <p *ngIf="error" class="error">
      {{error}}
    </p>
    <prx-line-timeseries-chart *ngIf="chartData" [datasets]="chartData" [dateFormat]="dateFormat"></prx-line-timeseries-chart>
  `,
  styleUrls: ['metrics-downloads.component.css']
})

export class MetricsDownloadsComponent {
  story: StoryModel;
  tabSub: Subscription;
  dateFormat = '%m/%d';
  beginDate: Date = new Date(moment().subtract(7, 'days').valueOf());
  endDate: Date = new Date(moment().add(1, 'days').valueOf());
  /* TODO: API tries to guess interval based on date range length, need to update UI accordingly
   10 days at 15m
   40 days at 1h
   2.7 years at 1d
   */
  interval = '1d';
  error: string;
  chartData: TimeseriesChartModel[];

  constructor(tab: TabService, private castle: CastleService) {
    this.beginDate.setHours(0, 0, 0);
    this.endDate.setHours(0, 0, 0);
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      this.requestMetrics();
    });
  }

  requestMetrics() {
    if (this.checkRequest()) {
      // TODO: needs obscure chart with overlay + loading circle
      this.castle.followList('prx:episode-downloads', {
        guid: '67f11a0d-1400-4ec7-8e7c-179446d802a0',
        from: moment(this.beginDate).format(),
        to: moment(this.endDate).format(),
        interval: this.interval
      }).subscribe(metrics => {
        if (metrics[0] && metrics[0]['downloads'] && metrics[0]['downloads'].length > 0) {
          let dataset = metrics[0]['downloads'].map(datum => {
            return new TimeseriesDatumModel(datum[1], moment(datum[0]).valueOf());
          });
          this.chartData = [new TimeseriesChartModel(dataset, this.story.title, '#368aa2')];
        } else {
          this.error = 'This podcast has no download metrics.';
          this.chartData = null;
        }
      });
    }
  }

  checkRequest() {
    if (this.beginDate.valueOf() >= this.endDate.valueOf()) {
      this.error = 'From date must be earlier than Through date.';
      return false;
    } else if (this.endDate.valueOf() - this.beginDate.valueOf() > 1000 * 60 * 60 * 24 * 4
      && this.interval !== '1d') {
      this.error = 'Date ranges more than 4 days apart must use daily interval.';
      return false;
    } else {
      this.error = '';
      return true;
    }
  }

  beginDateChange(date: Date) {
    this.beginDate = date;
    this.requestMetrics();
  }

  endDateChange(date: Date) {
    this.endDate = date;
    this.requestMetrics();
  }

  intervalChange(interval: string) {
    this.interval = interval;
    switch (this.interval) {
      case '1d':
        this.dateFormat = '%m/%d';
        break;
      case '1h':
      case '15m':
        this.dateFormat = '%m/%d %H:%M';
        break;
      default:
        break;
    }
    this.requestMetrics();
  }
}
