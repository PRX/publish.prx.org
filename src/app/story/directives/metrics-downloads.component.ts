import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { StoryModel, TabService } from '../../shared';
import { TimeseriesChartModel, TimeseriesDatumModel } from 'styleguide.prx.org';

@Component({
  template: `
    <!--<p>-->
      <label>From:</label>
      <prx-datepicker [date]="beginDate" (dateChange)="onBeginDateChange($event)"></prx-datepicker>
      <prx-timepicker [date]="beginDate" (dateChange)="onBeginDateChange($event)"></prx-timepicker>
    <!--</p>
    <p>-->
      <label>Through:</label>
      <prx-datepicker [date]="endDate" (dateChange)="onEndDateChange($event)"></prx-datepicker>
      <prx-timepicker [date]="endDate" (dateChange)="onEndDateChange($event)"></prx-timepicker>
    <!--</p>
    <p>-->
      <label for="interval">Interval:</label>
      <select id="interval">
        <option>15 minutes</option>
        <option>hourly</option>
      </select>
    <!--</p>-->
    <prx-line-timeseries-chart *ngIf="chartData" [datasets]="chartData" [dateFormat]="dateFormat"></prx-line-timeseries-chart>
  `
})

export class ChartDownloadsComponent {
  story: StoryModel;
  tabSub: Subscription;
  dateFormat = '%m/%d';
  beginDate: Date = new Date(moment().subtract(7, 'days').valueOf());
  endDate: Date = new Date(moment().valueOf());
  chartData: TimeseriesChartModel[];

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      let dataset = [56, 39, 31, 22, 13, 14, 15].map((value, i, data) => {
        return new TimeseriesDatumModel(value, moment(this.beginDate).subtract(data.length - i, 'days').valueOf());
      });
      this.chartData = [new TimeseriesChartModel(dataset, s.title, '#368aa2')];
    });
  }

  onBeginDateChange(date: Date) {
    this.beginDate = date;
  }

  onEndDateChange(date: Date) {
    this.endDate = date;
  }
}
