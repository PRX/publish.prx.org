import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable , Subject } from 'rxjs';
import { CmsService } from '../core';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { StoryModel } from '../shared';

@Component({
  providers: [TabService],
  selector: 'publish-story',
  styleUrls: ['story.component.css'],
  template: `
    <publish-story-hero [id]="id" [story]="story"></publish-story-hero>

    <prx-tabs [model]="story">
      <nav>
        <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" [routerLink]="base">Basic Info</a>
        <a *ngIf="distPodcast" routerLinkActive="active" [routerLink]="[base, 'podcast']">Podcast Episode Info</a>
        <a *ngIf="distPlayer" routerLinkActive="active" [routerLink]="[base, 'player']">Embeddable Player</a>
      </nav>
      <div class="sticky-area" *ngIf="story">
        <div prxSticky="sidebar" class="sticky-container">
          <publish-story-status [id]="id" [story]="story"></publish-story-status>
        </div>
      </div>
    </prx-tabs>
  `
})

export class StoryComponent implements OnInit {

  id: number;
  base: string;
  seriesId: number;
  story: StoryModel;

  // distribution specific tabs
  distPodcast = false;
  distPlayer = false;

  constructor(
    private cms: CmsService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: ModalService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.forEach(params => {
      this.id = +params['id'];
      this.seriesId = +params['seriesId'];
      this.base = '/story/' + (this.id || 'new');
      if (this.seriesId) {
        this.base += `/${this.seriesId}`;
      }
      this.loadStory();
      this.showDistributionTabs();
    });
  }

  loadStory() {
    if (this.id) {
      this.cms.auth.follow('prx:story', {id: this.id}).subscribe(
        story => {
          if (story.has('prx:series')) {
            story.follow('prx:series').subscribe(series => this.setStory(series, story));
          } else {
            this.setStory(null, story);
          }
        },
        err => {
          if (err.status === 404 && err.name === 'HalHttpError') {
            this.toastr.error('No episode found. Redirecting to new episode page');
            console.error(`Story with id ${this.id} not found`);
            setTimeout(() => this.router.navigate(['/story', 'new']), 3000);
          } else {
            throw(err);
          }
        }
      );
    } else if (this.seriesId) {
      this.cms.auth.follow('prx:series', {id: this.seriesId}).subscribe(s => this.setStory(s, null));
    } else {
      this.cms.defaultAccount.subscribe(a => this.setStory(a, null));
    }
  }

  setStory(parent: any, story: any) {
    this.story = new StoryModel(parent, story);
    this.showDistributionTabs();
    this.checkStoryVersion();
  }

  checkStoryVersion() {
    if (!this.story.isV4()) {
      let oldLink = `https://www.prx.org/pieces/${this.id}`;
      this.modal.alert(
        'Cannot Edit Episode',
        `This episode was created in the older PRX.org app, and must be
        edited there. <a target="_blank" href="${oldLink}">Click here</a> to view it.`,
        () => { window.history.back(); }
      );
    }
  }

  showDistributionTabs() {
    this.distPlayer = this.id ? true : false;
    if (this.story && this.story.isNew) {
      this.story.getSeriesDistribution('podcast').subscribe(dist => {
        this.distPodcast = dist ? true : false;
      });
    } else if (this.story) {
      this.story.loadRelated('distributions').subscribe(() => {
        this.distPodcast = this.story.distributions.some(d => d.kind === 'episode');
      });
    }
  }

  canDeactivate(next: any, prev: any): boolean | Observable<boolean> {
    if (this.story && this.story.changed() && !this.story.isDestroy) {
      let thatsOkay = new Subject<boolean>();
      this.modal.confirm(
        'Unsaved changes',
        `This episode has unsaved changes. You may discard the changes and
          continue or click 'Cancel' to complete and save the episode.`,
        (confirm: boolean) => {
          if (confirm) {
            this.story.discard();
          }
          thatsOkay.next(confirm);
          thatsOkay.complete();
        },
        'Discard'
      );
      return thatsOkay;
    } else {
      return true;
    }
  }
}
