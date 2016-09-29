import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

import { CmsService, ModalService } from '../core';
import { StoryModel } from '../shared';

@Component({
  selector: 'publish-story',
  styleUrls: ['story.component.css'],
  template: `
    <publish-story-hero [story]="story"></publish-story-hero>

    <publish-tabs [model]="story">

      <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
        [routerLink]="editLink">STEP 1: {{id ? 'Edit' : 'Create'}} your story</a>
      <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
        [routerLink]="['decorate']">STEP 2: Decorate your story</a>
      <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
        [routerLink]="['sell']">STEP 3: Sell your story</a>

      <button *ngIf="id" class="extras delete" (click)="confirmDelete()">Delete</button>

    </publish-tabs>
  `
})

export class StoryComponent implements OnInit, OnDestroy {

  private id: number;
  private seriesId: number;
  private story: StoryModel;
  private editLink: any[];
  private routeSub: Subscription;

  constructor(
    private cms: CmsService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: ModalService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = +params['id'];
      this.seriesId = +params['series_id'];

      // must explicitly set the base-link for this edit/create route
      if (this.id) {
        this.editLink = ['/story', this.id];
      } else {
        this.editLink = ['/story/new'];
        if (this.seriesId) {
          this.editLink.push(this.seriesId);
        }
      }

      // (1) existing story, (2) new series-story, (3) new standalone-story
      let auth = this.cms.follow('prx:authorization');
      if (this.id) {
        auth.follow('prx:story', {id: this.id}).subscribe(doc => {
          if (doc.has('prx:series')) {
            doc.follow('prx:series').subscribe(s => this.story = new StoryModel(s, doc));
          } else if (doc.has('prx:account')) {
            doc.follow('prx:account').subscribe(a => this.story = new StoryModel(a, doc));
          } else {
            console.error('WOH: story has no series or account!');
            this.story = new StoryModel(null, doc);
          }
          this.checkStoryVersion();
        });
      } else if (this.seriesId) {
        auth.follow('prx:series', {id: this.seriesId}).subscribe(seriesDoc => {
          this.story = new StoryModel(seriesDoc, null);
        });
      } else {
        auth.follow('prx:default-account').subscribe(accountDoc => {
          this.story = new StoryModel(accountDoc, null);
        });
      }
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  checkStoryVersion() {
    if (!this.story.isV4()) {
      let oldLink = `https://www.prx.org/pieces/${this.id}`;
      this.modal.alert(
        'Cannot Edit Story',
        `This episode was created in the older PRX.org app, and must be
        edited there. <a target="_blank" href="${oldLink}">Click here</a> to view it.`,
        () => { window.history.back(); }
      );
    }
  }

  canDeactivate(next: any, prev: any): boolean | Observable<boolean> {
    if (this.story && this.story.changed()) {
      let thatsOkay = new Subject<boolean>();
      this.modal.prompt(
        'Unsaved changes',
        'This story has unsaved changes - they will be saved locally when you return here',
        (okay: boolean) => { thatsOkay.next(okay); thatsOkay.complete(); }
      );
      return thatsOkay;
    } else {
      return true;
    }
  }

  confirmDelete(): void {
    this.modal.prompt(
      'Really delete?',
      'Are you sure you want to delete this story?  This action cannot be undone.',
      (okay: boolean) => {
        if (okay) {
          this.story.isDestroy = true;
          this.story.save().subscribe(() => {
            this.router.navigate(['/']);
          });
        }
      }
    );
  }

}
