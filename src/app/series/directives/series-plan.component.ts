import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription, concat } from 'rxjs';
import { map, concatMap, mergeMap } from 'rxjs/operators';
import { TabService, SimpleDate, HalDoc } from 'ngx-prx-styleguide';
import { SeriesModel } from '../../shared';

const MAX_PLAN_DAYS = 730;

@Component({
  styleUrls: ['series-plan.component.scss'],
  templateUrl: 'series-plan.component.html',
})

export class SeriesPlanComponent implements OnDestroy {

  tabSub: Subscription;
  series: HalDoc;
  seriesId: number;

  isPodcast = false;
  noTemplates = false;
  templateOptions: string[][] = [];
  templateLink: string;

  planMinDate: SimpleDate;
  planDefaultDate: SimpleDate;
  planned: SimpleDate[] = [];

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

  creating = false;
  created = 0;
  createSuccess = false;
  createError: string;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.setSeries(s));
    this.planMinDate = new SimpleDate(this.tomorrow, true);
    this.planDefaultDate = this.planMinDate;
    this.generateStartingAt = this.planMinDate.toLocaleDate();
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  setSeries(s: SeriesModel) {
    this.series = s.doc;
    this.seriesId = this.series.id;
    this.series.followItems('prx:distributions').subscribe(docs => {
      this.isPodcast = docs.some(doc => doc['kind'] === 'podcast');
    });
    this.series.followItems('prx:audio-version-templates').subscribe(docs => {
      this.noTemplates = docs.length === 0;
      this.templateOptions = docs.map(doc => [doc['label'], doc.expand('self')]);
      this.templateLink = this.templateOptions.length ? this.templateOptions[0][1] : null;
    });
  }

  selectTemplate(link: string) {
    this.templateLink = link;
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
      this.generateMax = null;
    }
    this.generate();
  }

  generate() {
    if (this.creating) { return; }

    this.planDefaultDate = new SimpleDate(this.generateStartingAt, true);
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
        this.planned.push(new SimpleDate(date, true));
      }
      date.setDate(date.getDate() + 1);
    }
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

  createEpisodes(): Observable<HalDoc[]> {
    this.creating = true;
    const create = concat(this.planned).pipe(concatMap(date => this.createStory(date)));
    create.subscribe(
      _docs => this.created++,
      err => this.createError = `Something went wrong: ${err}`,
      () => this.createSuccess = true,
    );
    return create;
  }

  private createStory(date: SimpleDate): Observable<HalDoc[]> {
    const releasedAt = date.toLocaleDate(/* TODO: hour offset? */);
    const title = releasedAt.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
    return this.series.create('prx:stories', {}, {title, releasedAt})
      .pipe(mergeMap(story => this.createVersion(story)));
  }

  private createVersion(story: HalDoc): Observable<HalDoc[]> {
    if (this.templateLink) {
      const data = {set_audio_version_template_uri: this.templateLink};
      return story.create('prx:audio-versions', {}, data).pipe(map(v => [story, v]));
    } else {
      return story.create('prx:audio-versions', {}, {}).pipe(map(v => [story, v]));
    }
  }

}
