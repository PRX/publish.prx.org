import { Component, Input, OnChanges } from '@angular/core';
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
        <div *ngFor="let i of emptyCards" class="empty-story-card"></div>
        <div *ngFor="let l of loaders" class="story"><publish-spinner></publish-spinner></div>
      </div>
    </div>
`
})

export class StoryListComponent implements OnChanges {
  @Input() noStories: boolean;
  @Input() stories: StoryModel[];
  @Input() loaders: boolean[];

  emptyCards: number[];

  ngOnChanges(changes: any) {
    if (changes['stories'] && changes['stories'].currentValue &&
        changes['stories'].currentValue.length > 0 && changes['stories'].currentValue.length % 3 > 0) {
      this.emptyCards = Array.from(Array(3 - changes['stories'].currentValue.length % 3), (x, i ) => i);
    }
  }
}
