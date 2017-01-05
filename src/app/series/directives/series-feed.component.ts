import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DistributionModel, SeriesModel, StoryModel, TabService } from '../../shared';

@Component({
  template: `
  <div>
    <publish-spinner *ngIf="!isLoaded"></publish-spinner>
    <section *ngIf="series && list">
      <div class="hint" *ngIf="noStories">
        You have no published stories in this series.
      </div>

      <section *ngIf="!noStories">
        <ul *ngIf="privateStories.length">
          <h4>Private</h4>
          <li *ngFor="let s of privateStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="private">No publication date set.</p>
          </li>
        </ul>

        <ul *ngIf="futurePublicStories.length">
          <h4>Set for future publication</h4>
          <li *ngFor="let s of futurePublicStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="futurePublic">Will be published {{s.pubDate}}.</p>
          </li>
        </ul>

        <ul *ngIf="publicStories.length">
          <h4>Public</h4>
          <li *ngFor="let s of publicStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="public">Published {{s.pubDate}}.</p>
          </li>
        </ul>

        <div class="extra" *ngIf="isLoaded">
          <a [routerLink]="['/search', { tab: 'stories', seriesId: series.id }]">
            Search among these stories.
          </a>
        </div>
      </section>
    </section>
    </div>
  `,
  styleUrls: ['./series-feed.component.css']
})

export class SeriesFeedComponent implements OnDestroy {

  isLoaded: boolean = false;
  noStories: boolean;
  series: SeriesModel;
  publicStories: StoryModel[] = [];
  futurePublicStories: StoryModel[] = [];
  privateStories: StoryModel[] = [];
  list: DistributionModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.noStories = false;
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      s.loadRelated('distributions').subscribe((dists) => {
        this.list = dists[0];
        this.sortStories();
      });
    });
  }

  sortStories() {
    this.list
        .parent
        .followItems('prx:stories', { sorts: 'updated_at:desc' })
        .subscribe((docs) => {
          this.isLoaded = true;
          if (docs.length === 0) {
            this.noStories = true;
            return;
          }
          docs.forEach((doc) => {
              let story = new StoryModel(this.list.parent, doc, false);
              if (!story.publishedAt) {
                this.privateStories.push(story);
                return;
              }
              story['pubDate'] = story.publishedAt.toLocaleDateString();
              if (new Date(story.publishedAt) <= new Date()) {
                this.publicStories.push(story);
              } else {
                this.futurePublicStories.push(story);
              }
            });
          });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }
}
