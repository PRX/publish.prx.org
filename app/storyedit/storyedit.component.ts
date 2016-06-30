import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, ActivatedRoute} from '@angular/router';
import {Observable, Subject, Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';
import {ModalService} from '../shared/modal/modal.service';
import {StoryTabService} from './services/storytab.service';
import {StoryModel} from './models/story.model';

import {HeroComponent} from './directives/hero.component';

@Component({
  directives: [ROUTER_DIRECTIVES, HeroComponent],
  providers: [StoryTabService],
  selector: 'publish-story-edit',
  styleUrls: ['app/storyedit/storyedit.component.css'],
  template: `
    <publish-story-hero></publish-story-hero>
    <div class="main">
      <section>
        <div class="subnav">
          <nav>
            <a [routerLinkActive]="['active']" [routerLink]="editLink">
              STEP 1: {{id ? 'Edit' : 'Create'}} your story
            </a>
            <a [routerLinkActive]="['active']" [routerLink]="['decorate']">
              STEP 2: Decorate your story
            </a>
            <a [routerLinkActive]="['active']" [routerLink]="['sell']">
              STEP 3: Sell your story
            </a>
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

export class StoryEditComponent implements OnInit, OnDestroy {

  private id: number;
  private seriesId: number;
  private story: StoryModel;
  private editLink: any[];
  private routeSub: Subscription;

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
      this.seriesId = +params['series_id'];

      // must explicitly set the base-link for this edit/create route
      if (this.id) {
        this.editLink = ['/edit', this.id];
      } else {
        this.editLink = ['/create'];
        if (this.seriesId) {
          this.editLink.push(this.seriesId);
        }
      }

      // (1) existing story, (2) new series-story, (3) new standalone-story
      let auth = this.cms.follow('prx:authorization');
      if (this.id) {
        auth.follow('prx:story', {id: this.id}).subscribe(storyDoc => {
          if (storyDoc.has('prx:series')) {
            storyDoc.follow('prx:series').subscribe(seriesDoc => {
              this.story = new StoryModel(seriesDoc, storyDoc);
              this.tab.setStory(this.story);
            });
          } else if (storyDoc.has('prx:account')) {
            storyDoc.follow('prx:account').subscribe(accountDoc => {
              this.story = new StoryModel(accountDoc, storyDoc);
              this.tab.setStory(this.story);
            });
          } else {
            console.error('WOH: story has no series or account!');
            this.story = new StoryModel(null, storyDoc);
            this.tab.setStory(this.story);
          }
        });
      } else if (this.seriesId) {
        auth.follow('prx:series', {id: this.seriesId}).subscribe(seriesDoc => {
          this.story = new StoryModel(seriesDoc, null);
          this.tab.setStory(this.story);
        });
      } else {
        auth.follow('prx:default-account').subscribe(accountDoc => {
          this.story = new StoryModel(accountDoc, null);
          this.tab.setStory(this.story);
        });
      }
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  canDeactivate(next: any, prev: any): boolean | Observable<boolean> {
    if (this.story.changed()) {
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
