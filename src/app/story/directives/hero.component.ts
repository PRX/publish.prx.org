import { Component, Input, OnChanges } from '@angular/core';
import { HalDoc } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-hero',
  styleUrls: ['hero.component.css'],
  template: `
    <prx-status-bar prxSticky="all" class="status_bar">
      <a prx-status-bar-link routerLink="/">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>{{ !id ? 'Create' : 'Edit' }} Episode</prx-status-bar-text>
      <prx-status-bar-text italic stretch>{{story && story.title || '(Untitled)'}}</prx-status-bar-text>
      <a prx-status-bar-link [routerLink]="['/series', series.id]" alignArt="right" *ngIf="series">
        <prx-status-bar-image [src]="series" alignAart="right"></prx-status-bar-image> {{series.title || '(Untitled Series)'}}
      </a>
    </prx-status-bar>
    `
})

export class StoryHeroComponent implements OnChanges {

  @Input() id: number;
  @Input() story: StoryModel;

  series: HalDoc;
  isChanged: boolean;
  isInvalid: string;

  ngOnChanges() {
    this.updateSeries();
  }

  updateSeries() {
    if (this.story && !this.series) {
      if (this.story.isNew && this.story.parent && this.story.parent.isa('series')) {
        this.series = this.story.parent;
      } else if (!this.story.isNew && this.story.doc.has('prx:series')) {
        this.story.doc.follow('prx:series').subscribe(e => this.series = e);
      }
    }
  }
}
