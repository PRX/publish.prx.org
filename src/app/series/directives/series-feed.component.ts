
import {of as observableOf,  Observable ,  Subscription } from 'rxjs';

import {mergeMap} from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';


import { HalDoc, HalObservable, TabService } from 'ngx-prx-styleguide';

const PER_PAGE = 50;

@Component({
  template: `
  <div>
    <section *ngIf="series">
      <div class="hint" *ngIf="noStories">
        You have no episodes in this series.
      </div>

      <section *ngIf="!noStories">
        <h4 *ngIf="privateStories.length">Draft</h4>
        <ul *ngIf="privateStories.length">
          <li *ngFor="let s of privateStories">
            <h5>
              <a [routerLink]="['/story', s.id]" [class.invalid]="s.status == 'invalid'">
                {{s.title}}
              </a>
            </h5>
            <p>{{s.duration || 0 | duration}}</p>
            <p></p>
          </li>
        </ul>

        <h4 *ngIf="futurePublicStories.length">Scheduled</h4>
        <ul *ngIf="futurePublicStories.length">
          <li *ngFor="let s of futurePublicStories" >
            <h5>
              <a [routerLink]="['/story', s.id]" [class.invalid]="s.status == 'invalid'">
                {{s.title}}
              </a>
            </h5>
            <p>{{s.duration || 0 | duration}}</p>
            <p class="futurePublic">{{s.publishedAt | date:'shortDate'}}</p>
          </li>
        </ul>

        <h4 *ngIf="publicStories.length">Published</h4>
        <ul *ngIf="publicStories.length">
          <li *ngFor="let s of publicStories" >
            <h5>
              <a [routerLink]="['/story', s.id]" [class.invalid]="s.status == 'invalid'">
                {{s.title}}
              </a>
            </h5>
            <p>{{s.duration || 0 | duration}}</p>
            <p>{{s.publishedAt | date:'shortDate'}}</p>
          </li>
        </ul>

        <div class="extra" *ngIf="isLoaded">
          <a [routerLink]="['/search', { tab: 'stories', seriesId: series.id }]">
            Search among these episodes.
          </a>
        </div>
      </section>

      <div class="extra" *ngIf="isLoaded">
        <a [routerLink]="['/story/new', series.id]">
          Create a new episode.
        </a>
      </div>

    </section>
    <prx-spinner *ngIf="!isLoaded" [class.paging]="isPaging"></prx-spinner>
  </div>
  `,
  styleUrls: ['./series-feed.component.css']
})

export class SeriesFeedComponent implements OnInit, OnDestroy {

  isLoaded = false;
  isPaging = false;
  noStories = false;
  series: HalDoc;
  publicStories: HalDoc[] = [];
  futurePublicStories: HalDoc[] = [];
  privateStories: HalDoc[] = [];
  tabSub: Subscription;

  constructor(private tab: TabService) {
    this.noStories = false;
  }

  ngOnInit() {
    this.tabSub = this.tab.model.subscribe(s => this.load(s.doc));
  }

  ngOnDestroy() {
    this.tabSub.unsubscribe();
  }

  load(series: HalDoc) {
    this.reset(series);
    if (series.count('prx:stories')) {
      const per = PER_PAGE;
      const zoom = 0;
      const sorts = 'released_at:desc,published_at:desc';
      const page1 = series.follow('prx:stories', {per, zoom, sorts});
      this.loadPages(page1).subscribe(() => this.isLoaded = true);
    } else {
      this.noStories = true;
      this.isLoaded = true;
    }
  }

  loadPages(page$: HalObservable<HalDoc>) {
    return page$.pipe(mergeMap(doc => {
      return doc.followList('prx:items').pipe(mergeMap(docs => {
        this.addStories(docs);
        if (doc.has('next')) {
          this.isPaging = true;
          const nextPage = doc.follow('next');
          return this.loadPages(nextPage);
        } else {
          return observableOf(null);
        }
      }));
    }));
  }

  addStories(stories: HalDoc[]) {
    stories.forEach(doc => {
      if (!doc['publishedAt']) {
        this.privateStories.push(doc);
      } else if (new Date(doc['publishedAt']) <= new Date()) {
        this.publicStories.push(doc);
      } else {
        this.futurePublicStories.push(doc);
      }
    });
  }

  reset(series: HalDoc) {
    this.series = series;
    this.isLoaded = false;
    this.isPaging = false;
    this.noStories = false;
    this.publicStories = [];
    this.futurePublicStories = [];
    this.privateStories = [];
  }

}
