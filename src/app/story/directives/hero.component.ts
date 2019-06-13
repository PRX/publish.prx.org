import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { HalDoc } from '../../core';
import { ToastrService } from 'ngx-prx-styleguide';
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
        <prx-status-bar-image src="series.follow('prx:image')" alignAart="right" *ngIf="series.has('prx:image')"></prx-status-bar-image> {{series.title || '(Untitled Series)'}}
      </a>
    </prx-status-bar>
    <!-- <prx-hero>
      <div class="hero-title">
        <h1 *ngIf="id">Edit Episode</h1>
        <h1 *ngIf="!id">Create Episode</h1>
        <a *ngIf="series" class="series" [routerLink]="['/series', series.id]">
          <prx-image [imageDoc]="series"></prx-image>
          <h3>{{series.title || '(Untitled Series)'}}</h3>
        </a>
      </div>
      <div class="hero-info" *ngIf="story">
        <h2>{{story.title || '(Untitled)'}}</h2>
      </div>
    </prx-hero> -->
    `
})

export class StoryHeroComponent implements OnInit, OnChanges {

  @Input() id: number;
  @Input() story: StoryModel;

  series: HalDoc;
  isChanged: boolean;
  isInvalid: string;

  constructor(private router: Router,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.updateBanner();
  }

  ngOnChanges(changes: any) {
    this.updateBanner();
  }

  updateBanner() {
    if (this.story) {
      if (this.story.isNew && this.story.parent && this.story.parent.isa('series')) {
        this.series = this.story.parent;
      } else if (!this.story.isNew && this.story.doc.has('prx:series')) {
        this.story.doc.follow('prx:series').subscribe(e => this.series = e);
      }
    }
  }
}
