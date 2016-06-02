import {Component, OnDestroy} from 'angular2/core';
import {Router, RouteConfig, RouterOutlet, RouterLink, RouteParams, CanDeactivate}
  from 'angular2/router';
import {Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';
import {ModalService} from '../shared/modal/modal.service';
import {StoryTabService} from './services/storytab.service';
import {StoryModel} from './models/story.model';

import {HeroComponent}     from './directives/hero.component';
import {EditComponent}     from './directives/edit.component';
import {DecorateComponent} from './directives/decorate.component';
import {SellComponent}     from './directives/sell.component';

@Component({
  directives: [RouterLink, RouterOutlet, HeroComponent],
  providers: [StoryTabService],
  selector: 'publish-story-edit',
  styleUrls: ['app/storyedit/storyedit.component.css'],
  template: `
    <publish-story-hero [title]="stepText" [story]="story"></publish-story-hero>
    <div class="main">
      <section>
        <div class="subnav">
          <nav *ngIf="storyId">
            <a [routerLink]="['Default']">STEP 1: Edit your story</a>
            <a [routerLink]="['Decorate']">STEP 2: Decorate your story</a>
            <a [routerLink]="['Sell']">STEP 3: Sell your story</a>
          </nav>
          <nav *ngIf="!storyId">
            <a [routerLink]="['Default']">STEP 1: Create your story</a>
            <a disabled>STEP 2: Decorate your story</a>
            <a disabled>STEP 3: Sell your story</a>
          </nav>
          <div class="extras">
            <button *ngIf="storyId" class="delete" (click)="confirmDelete()">Delete</button>
          </div>
        </div>
        <div class="page">
          <router-outlet></router-outlet>
        </div>
      </section>
    </div>
    `
})

@RouteConfig([
  { path: '/',         name: 'Default',  component: EditComponent, useAsDefault: true },
  { path: '/decorate', name: 'Decorate', component: DecorateComponent },
  { path: '/sell',     name: 'Sell',     component: SellComponent }
])

export class StoryEditComponent implements OnDestroy, CanDeactivate {

  private storyId: string;
  private story: StoryModel;
  private stepText: string;
  private tabSub: Subscription;

  constructor(
    private cms: CmsService,
    private tab: StoryTabService,
    private router: Router,
    private params: RouteParams,
    private modal: ModalService
  ) {
    this.storyId = params.params['id'];
    if (this.storyId) {
      cms.follow('prx:authorization').follow('prx:story', {id: this.storyId}).subscribe((doc) => {
        this.story = new StoryModel(null, doc);
        this.tab.setStory(this.story);
      });
    } else {
      cms.account.subscribe((accountDoc) => {
        this.story = new StoryModel(accountDoc, null);
        this.tab.setStory(this.story);
      });
    }
    this.tabSub = this.tab.heroText.subscribe((text) => {
      this.stepText = text;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  routerCanDeactivate(next: any, prev: any): Promise<boolean> {
    if (this.story.changed()) {
      return new Promise<boolean>((resolve, reject) => {
        this.modal.prompt(
          'Unsaved changes',
          'This story has unsaved changes - they will be saved locally when you return here',
          (okay: boolean) => { resolve(okay); }
        );
      });
    }
  }

  confirmDelete(): void {
    this.modal.prompt(
      'Really delete?',
      'Are you sure you want to delete this story?  This action cannot be undone.',
      (okay: boolean) => {
        this.story.isDestroy = true;
        this.story.save().subscribe(() => {
          this.router.parent.navigate(['Home']);
        });
      }
    );
  }

}
