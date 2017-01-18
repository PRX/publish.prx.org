import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, StoryModel, TabService } from '../../shared';

@Component({
  template: `
  <div>
    <publish-spinner *ngIf="!isLoaded"></publish-spinner>
    <section *ngIf="series">
      <div class="hint" *ngIf="noStories">
        You have no published episodes in this series.
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
            Search among these episodes.
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
          .followItems('prx:stories', { per: total })
          .subscribe((docs) => {
            this.isLoaded = true;
            docs.forEach((doc) => {
                let story = new StoryModel(this.series.doc, doc, false);
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
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }
}
