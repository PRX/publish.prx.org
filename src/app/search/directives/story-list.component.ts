import { Component, Input } from '@angular/core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-list',
  styleUrls: ['story-list.component.css'],
  template: `
    <div *ngIf="noStories">
      <h1>No Stories match your search</h1>
    </div>
    <div *ngIf="!noStories">
      <div class="story-list">
        <publish-story-card *ngFor="let s of stories" [story]="s"></publish-story-card>
        <div *ngFor="let l of storyLoaders" class="story"><publish-spinner></publish-spinner></div>
      </div>
    </div>
`
})

export class StoryListComponent {
  @Input() noStories: boolean;
  @Input() stories: StoryModel[];
  @Input() storyLoaders: boolean[];
}
