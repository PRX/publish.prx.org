import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, CanDeactivate, ActivatedRoute} from '@angular/router';
import {Observable, Subject, Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';
import {ModalService} from '../shared/modal/modal.service';
import {StoryTabService} from './services/storytab.service';
import {StoryModel} from './models/story.model';

import {HeroComponent} from './directives/hero.component';

interface CanDeact { canDeactivate: () => boolean | Observable<boolean>; }

@Component({
  directives: [ROUTER_DIRECTIVES, HeroComponent],
  providers: [StoryTabService],
  selector: 'publish-story-edit',
  styleUrls: ['app/storyedit/storyedit.component.css'],
  template: `
    <publish-story-hero [title]="stepText" [story]="story"></publish-story-hero>
    <div class="main">
      <section>
        <div class="subnav">
          <nav *ngIf="id">
            <a [routerLink]="['Default']">STEP 1: Edit your story</a>
            <a [routerLink]="['Decorate']">STEP 2: Decorate your story</a>
            <a [routerLink]="['Sell']">STEP 3: Sell your story</a>
          </nav>
          <nav *ngIf="!id">
            <a [routerLink]="['Default']">STEP 1: Create your story</a>
            <a disabled>STEP 2: Decorate your story</a>
            <a disabled>STEP 3: Sell your story</a>
          </nav>
          <div class="extras">
            <button *ngIf="id" class="delete" (click)="confirmDelete()">Delete</button>
          </div>
        </div>
        <div class="page">
          <router-outlet></router-outlet>
        </div>
      </section>
    </div>
    `
})

export class StoryEditComponent implements OnInit, OnDestroy, CanDeactivate<CanDeact> {

  private id: number;
  private story: StoryModel;
  private stepText: string;
  private routeSub: Subscription;
  private tabSub: Subscription;

  constructor(
    private cms: CmsService,
    private tab: StoryTabService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: ModalService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = +params['id'];
      if (this.id) {
        this.cms.follow('prx:authorization').follow('prx:story', {id: this.id}).subscribe(doc => {
          this.story = new StoryModel(null, doc);
          this.tab.setStory(this.story);
        });
      } else {
        this.cms.account.subscribe(accountDoc => {
          this.story = new StoryModel(accountDoc, null);
          this.tab.setStory(this.story);
        });
      }
    });
    this.tabSub = this.tab.heroText.subscribe((text) => {
      this.stepText = text;
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.tabSub.unsubscribe();
  }

  canDeactivate(next: any, prev: any): Observable<boolean> {
    if (this.story.changed()) {
      let thatsOkay = new Subject<boolean>();
      this.modal.prompt(
        'Unsaved changes',
        'This story has unsaved changes - they will be saved locally when you return here',
        (okay: boolean) => { thatsOkay.next(true); }
      );
      return thatsOkay;
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
