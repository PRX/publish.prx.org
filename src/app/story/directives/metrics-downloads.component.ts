import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';
import { Env } from '../../core/core.env';
import { CastleService } from '../../core';
import { FeederEpisodeModel, StoryModel } from '../../shared';
import { TabService, TimeseriesChartModel, TimeseriesDatumModel } from 'ngx-prx-styleguide';

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
          <option *ngFor="let i of intervalOptions" [value]="i.value">{{i.name}}</option>
        </select>
      </p>
    </div>
    <p *ngIf="error" class="error">
      {{error}}
    </p>
    <div *ngIf="!chartData && !error" class="chart-loading"><prx-spinner></prx-spinner></div>
    <prx-timeseries-chart *ngIf="chartData" type="line" [datasets]="chartData" [formatX]="dateFormat"></prx-timeseries-chart>
  `,
  styleUrls: ['metrics-downloads.component.css']
})

export class MetricsDownloadsComponent {
  INTERVAL_DAILY = {value: '1d', name: 'daily'};
  INTERVAL_HOURLY = {value: '1h', name: 'hourly'};
  INTERVAL_15MIN = {value: '15m', name: '15 minutes'};
  intervalOptions = [this.INTERVAL_15MIN, this.INTERVAL_HOURLY, this.INTERVAL_DAILY];
  story: StoryModel;
  episode: FeederEpisodeModel;
  tabSub: Subscription;
  dateFormat = '%m/%d';
  beginDate: Date = new Date(moment().subtract(7, 'days').valueOf());
  endDate: Date = new Date(moment().add(1, 'days').valueOf());
  interval = this.INTERVAL_DAILY.value;
  error: string;
  chartData: TimeseriesChartModel[];

  constructor(tab: TabService, private castle: CastleService) {
    this.beginDate.setHours(0, 0, 0);
    this.endDate.setHours(0, 0, 0);
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      this.story.loadRelated('distributions', true).subscribe(() => {
        let storyDistribution = this.story.distributions.find(d => d.kind === 'episode');
        if (storyDistribution) {
          storyDistribution.loadRelated('episode').subscribe(() => {
            this.episode = storyDistribution.episode;
            this.requestMetrics();
          });
        }
      });
    });
  }

  requestMetrics() {
    this.chartData = null;
    if (this.checkRequest()) {
      this.castle.followList('prx:episode-downloads', {
        guid: Env.CASTLE_TEST_EPISODE || this.episode.id,
        from: moment(this.beginDate).format(),
        to: moment(this.endDate).format(),
        interval: this.interval
      }).subscribe(
        metrics => this.setMetrics(metrics),
        err => {
          if (err.name === 'HalHttpError' && err.status === 401) {
            this.error = 'An error occurred while requesting episode metrics';
            console.error(err);
          } else {
            this.error = 'This podcast has no download metrics.';
          }
        }
      );
    }
  }

  setMetrics(metrics: any) {
    if (metrics[0] && metrics[0]['downloads'] && metrics[0]['downloads'].length > 0) {
      let dataset = metrics[0]['downloads'].map(datum => {
        return { value: datum[1], date: moment(datum[0]).valueOf() };
      });
      this.chartData = [{ data: dataset, label: this.story.title, color: '#61A85D' }];
    } else {
      this.error = 'This podcast has no download metrics.';
    }
  }

  checkRequest() {
    if (!this.story || !this.story.publishedAt) {
      this.error = 'Metrics are not available for episodes that are not published.';
      return false;
    } else if (this.beginDate.valueOf() >= this.endDate.valueOf()) {
      this.error = 'From date should be earlier than Through date.';
      return false;
    } else if (this.isMoreThanXDays(40) && this.interval !== this.INTERVAL_DAILY.value) {
      this.error = 'Date ranges more than 40 days apart should use daily interval.';
      return false;
    } else if (this.isMoreThanXDays(10) &&
      (this.interval !== this.INTERVAL_DAILY.value && this.interval !== this.INTERVAL_HOURLY.value)) {
      this.error = 'Date ranges more than 10 days apart should use hourly or daily interval.';
      return false;
    } else {
      this.error = null;
      return true;
    }
  }

  beginDateChange(date: Date) {
    this.beginDate = date;
    this.adjustIntervalOptions();
    this.requestMetrics();
  }

  endDateChange(date: Date) {
    this.endDate = date;
    this.adjustIntervalOptions();
    this.requestMetrics();
  }

  intervalChange(interval: string) {
    this.interval = interval;
    switch (this.interval) {
      case this.INTERVAL_DAILY.value:
        this.dateFormat = '%m/%d';
        break;
      case this.INTERVAL_HOURLY.value:
      case this.INTERVAL_15MIN.value:
        this.dateFormat = '%m/%d %H:%M';
        break;
      default:
        break;
    }
    this.requestMetrics();
  }

  isMoreThanXDays(x: number): boolean {
    return this.endDate.valueOf() - this.beginDate.valueOf() > (1000 * 60 * 60 * 24 * x); // x days
  }

  adjustIntervalOptions() {
    /* API requests limited as follows:
     10 days at 15m
     40 days at 1h
     2.7 years at 1d
     */
    if (this.isMoreThanXDays(40)) {
      this.intervalOptions = [this.INTERVAL_DAILY];
      this.interval = this.INTERVAL_DAILY.value;
    } else if (this.isMoreThanXDays(10)) {
      this.intervalOptions = [this.INTERVAL_HOURLY, this.INTERVAL_DAILY];
      if (this.interval === this.INTERVAL_15MIN.value) {
        this.interval = this.INTERVAL_HOURLY.value;
      }
    } else {
      this.intervalOptions = [this.INTERVAL_15MIN, this.INTERVAL_HOURLY, this.INTERVAL_DAILY];
    }
  }
}
