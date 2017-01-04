import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DistributionModel, SeriesModel, StoryModel, TabService } from '../../shared';

@Component({
  template: `
    <section *ngIf="series && podcast">
      <div class="hint" *ngIf="noStories">
        You have no published stories in this podcast.
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
          <h4>Public feed</h4>
          <li *ngFor="let s of publicStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="public">Published {{s.pubDate}}.</p>
          </li>
        </ul>
      </section>
    </section>
  `,
  styleUrls: ['./series-feed.component.css']
})

export class SeriesFeedComponent implements OnDestroy {

  noStories: boolean;
  series: SeriesModel;
  publicStories: StoryModel[] = [];
  futurePublicStories: StoryModel[] = [];
  privateStories: StoryModel[] = [];
  podcast: DistributionModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.noStories = false;
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.podcast = s.distributions.filter(dist => dist.kind === 'podcast')[0];
      this.sortStories();
    });
  }

  sortStories() {
    this.podcast
        .parent
        .followItems('prx:stories', { sorts: 'updated_at:desc' })
        .subscribe((docs) => {
          if (docs.length === 0) {
            this.noStories = true;
            return;
          }
          docs.forEach((doc) => {
              let story = new StoryModel(this.podcast.parent, doc, false);
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
