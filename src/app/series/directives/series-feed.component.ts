import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DistributionModel, SeriesModel, StoryModel, TabService } from '../../shared';
import { HalDoc } from '../../core';

@Component({
  template: `
    <section *ngIf="series && podcast">
      <h3>Published Feed</h3>

      <div class="hint" *ngIf="noStories">
        You have no published stories in this podcast.
      </div>

      <section *ngIf="!noStories">
        <h4>Here are your private stories. They do not appear in your podcast feed.</h4>
        <ul class="private">
          <li *ngFor="let s of privateStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="hint">Private.</p>
          </li>
        </ul>
        <h4>Here are your stories set to be published in the future. </h4>
        <ul class="futurePublic">
          <li *ngFor="let s of futurePublicStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="hint">To be published {{s.pubDate}}.</p>
          </li>
        </ul>
        <h4>Here are your published stories as they currently appear in your podcast feed.</h4>
        <ul class="public">
          <li *ngFor="let s of publicStories">
            <h5><a [routerLink]="['/story', s.id]">{{s.title}}</a></h5>
            <p class="hint">Published {{s.pubDate}}.</p>
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
  publicStories: StoryModel[];
  futurePublicStories: StoryModel[];
  privateStories: StoryModel[];
  podcast: DistributionModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.noStories = false;
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.podcast = s.distributions.filter(dist => dist.kind === 'podcast')[0];
      this.setStories();
    });
  }

  setStories() {
    this.podcast
        .parent
        .followItems('prx:stories', { sorts: 'updated_at:desc' })
        .subscribe((docs) => {
          if (docs.length === 0) {
            this.noStories = true;
            return;
          }
          this.publicStories = docs
            .filter(doc => this.publicStoryDoc(doc))
            .map((doc) => {
              let story = new StoryModel(this.podcast.parent, doc, false);
              story['pubDate'] = story.publishedAt.toLocaleDateString();
              return story;
            });
          this.futurePublicStories = docs
            .filter(doc => this.futurePublicStoryDoc(doc))
            .map((doc) => {
              let story = new StoryModel(this.podcast.parent, doc, false);
              story['pubDate'] = story.publishedAt.toLocaleDateString();
              return story;
            });
          this.privateStories = docs
            .filter(doc => this.privateStoryDoc(doc))
            .map((doc) => {
               return new StoryModel(this.podcast.parent, doc, false);
            });
        });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  publicStoryDoc(doc: HalDoc): boolean {
    return doc['publishedAt'] && new Date(doc['publishedAt']) <= new Date();
  }

  futurePublicStoryDoc(doc: HalDoc): boolean {
    return doc['publishedAt'] && new Date(doc['publishedAt']) > new Date();
  }

  privateStoryDoc(doc: HalDoc): boolean {
    return !doc['publishedAt'];
  }

}
