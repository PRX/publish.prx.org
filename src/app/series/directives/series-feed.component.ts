import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TabService } from 'ngx-prx-styleguide';
import { SeriesModel, StoryModel } from '../../shared';

@Component({
  template: `
  <div>
    <prx-spinner *ngIf="!isLoaded"></prx-spinner>
    <section *ngIf="series">
      <div class="hint" *ngIf="noStories">
        You have no published episodes in this series.
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
            <p>{{s.doc?.duration || 0 | duration}}</p>
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
            <p>{{s.doc?.duration || 0 | duration}}</p>
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
            <p>{{s.doc?.duration || 0 | duration}}</p>
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
    </div>
  `,
  styleUrls: ['./series-feed.component.css']
})

export class SeriesFeedComponent implements OnDestroy {

  isLoaded = false;
  noStories: boolean;
  series: SeriesModel;
  publicStories: StoryModel[] = [];
  futurePublicStories: StoryModel[] = [];
  privateStories: StoryModel[] = [];
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.noStories = false;
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.sortStories();
    });
  }

  sortStories() {
    let total = this.series.doc.count('prx:stories');
    if (total === 0) {
      this.noStories = true;
      this.isLoaded = true;
    } else {
      this.series
          .doc
          .followItems('prx:stories', { per: total, sorts: 'released_at: desc, published_at: desc' })
          .subscribe((docs) => {
            this.isLoaded = true;
            docs.forEach((doc) => {
                let story = new StoryModel(this.series.doc, doc, false);
                if (!story.publishedAt) {
                  this.privateStories.push(story);
                  return;
                }
                if (new Date(story.publishedAt) <= new Date()) {
                  this.publicStories.push(story);
                } else {
                  this.futurePublicStories.push(story);
                }
              });
            });
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }
}
