import { Component, Input } from '@angular/core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-list',
  styleUrls: ['story-list.component.css'],
  template: `
    <div *ngIf="noStories">
      <h1>No Episodes match your search</h1>
    </div>
    <div *ngIf="!noStories">
      <div class="story-list">
        <publish-story-card *ngFor="let s of stories" [story]="s"></publish-story-card>
        <div *ngIf="!isLoaded" class="story-loading"><prx-spinner></prx-spinner></div>
        <div *ngFor="let i of emptyCards" class="empty-story-card"></div>
      </div>
    </div>
`
})

export class StoryListComponent {
  @Input() noStories: boolean;
  @Input() stories: StoryModel[];
  @Input() isLoaded: boolean;

  emptyCards: number[] = [1, 2]; // These are fillers for cheating the flexbox "grid"
}
