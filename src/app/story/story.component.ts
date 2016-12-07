import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { CmsService, ModalService } from '../core';
import { StoryModel } from '../shared';

@Component({
  selector: 'publish-story',
  styleUrls: ['story.component.css'],
  template: `
    <publish-story-hero [id]="id" [story]="story"></publish-story-hero>

    <publish-tabs [model]="story">
      <nav>
        <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" [routerLink]="base">Basic Info</a>
        <a routerLinkActive="active" [routerLink]="[base, 'podcast']">Podcast Distribution</a>
        <a routerLinkActive="active" [routerLink]="[base, 'player']">Embeddable Player</a>
      </nav>
      <button *ngIf="id" class="delete" (click)="confirmDelete()">Delete</button>
    </publish-tabs>
  `
})

export class StoryComponent implements OnInit {

  private id: number;
  private base: string;
  private seriesId: number;
  private story: StoryModel;

  constructor(
    private cms: CmsService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: ModalService
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
    });
  }

  loadStory() {
    if (this.id) {
      this.cms.auth.follow('prx:story', {id: this.id}).subscribe(s => this.setStory(null, s));
    } else if (this.seriesId) {
      this.cms.auth.follow('prx:series', {id: this.seriesId}).subscribe(s => this.setStory(s, null));
    } else {
      this.cms.account.subscribe(a => this.setStory(a, null));
    }
  }

  setStory(parent: any, story: any) {
    this.story = new StoryModel(parent, story);
    this.checkStoryVersion();
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
    if (this.story && this.story.changed() && !this.story.isDestroy) {
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
