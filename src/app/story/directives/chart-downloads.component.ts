import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { StoryModel, TabService } from '../../shared';
import { TimeseriesChartModel, TimeseriesDatumModel } from 'styleguide.prx.org';

@Component({
  template: `
    <prx-line-timeseries-chart *ngIf="chartData" [datasets]="chartData" [dateFormat]="dateFormat"></prx-line-timeseries-chart>
  `
})

export class ChartDownloadsComponent {
  story: StoryModel;
  tabSub: Subscription;
  dateFormat = '%m/%d';
  chartData: TimeseriesChartModel[];

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      let dataset = [56, 39, 31, 22, 13, 14, 15].map((value, i, data) => {
        return new TimeseriesDatumModel(value, moment().subtract(data.length - i, 'days').valueOf());
      });
      this.chartData = [new TimeseriesChartModel(dataset, s.title, '#368aa2')];
    });
  }
}
