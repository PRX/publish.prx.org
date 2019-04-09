import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TabService, SimpleDate } from 'ngx-prx-styleguide';
import { SeriesModel } from '../../shared';

const MAX_PLAN_DAYS = 730;

@Component({
  styleUrls: ['series-plan.component.scss'],
  templateUrl: 'series-plan.component.html',
})

export class SeriesPlanComponent implements OnDestroy {

  tabSub: Subscription;
  series: SeriesModel;
  seriesId: number;

  planMinDate: SimpleDate;
  planDefaultDate: SimpleDate;
  planned: SimpleDate[] = [];
  audioVersionOptions: string[][];

  objectKeys = Object.keys;
  days = {0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false};
  dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  weeks = {1: false, 2: false, 3: false, 4: false, 5: false};
  everyOtherWeek = false;

  tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  generateStartingAt: Date;
  generateEndingAt: Date;
  generateMax = 10;
  recurLimit = true;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.seriesId = s.id;
      this.series = s;
    });

    this.planMinDate = new SimpleDate(this.tomorrow, true);
    this.planDefaultDate = this.planMinDate;
    this.generateStartingAt = this.planMinDate.toLocaleDate();
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  toggleEveryOtherWeek() {
    if (this.everyOtherWeek = !this.everyOtherWeek) {
      Object.keys(this.weeks).forEach(k => this.weeks[k] = false);
    }
    this.generate();
  }

  toggleRecur() {
    if (this.recurLimit = !this.recurLimit) {
      this.generateEndingAt = null;
      this.generateMax = 10;
    } else {
      this.generateEndingAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      this.generateMax = 10;
    }
    this.generate();
  }

  generate() {
    this.planDefaultDate = null;
    this.planned = [];
    if (Object.keys(this.weeks).some(k => this.weeks[k])) {
      this.everyOtherWeek = false;
    }

    const date = new Date(this.generateStartingAt);
    for (let i = 0; i < MAX_PLAN_DAYS; i++) {
      if (this.generateEndingAt && date > this.generateEndingAt) { break; }
      if (this.generateMax && this.planned.length >= this.generateMax) { break; }

      const day = date.getDay();
      if (this.days[day] && this.shouldGenerateWeek(date)) {
        this.planDefaultDate = this.planDefaultDate || new SimpleDate(date, true);
        this.planned.push(new SimpleDate(date, true));
      }
      date.setDate(date.getDate() + 1);
    }

    this.planDefaultDate = this.planDefaultDate || new SimpleDate(this.tomorrow, true);
  }

  shouldGenerateWeek(date: Date) {
    if (this.everyOtherWeek) {
      return this.getWeeksFromStart(date) % 2 === 0;
    } else {
      return this.weeks[this.getWeekOfMonth(date)];
    }
  }

  getWeeksFromStart(date: Date): number {
    if (this.generateStartingAt) {
      const elapsed = this.generateStartingAt.valueOf() - date.valueOf();
      return Math.round(elapsed / (7 * 24 * 60 * 60 * 1000));
    } else {
      return null;
    }
  }

  getWeekOfMonth(date: Date) {
    const zeroIndexedDate = date.getUTCDate() - 1;
    return Math.floor(zeroIndexedDate / 7) + 1;
  }

}
