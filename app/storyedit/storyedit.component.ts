import {Component, OnDestroy, ViewChild} from 'angular2/core';
import {Router, RouteConfig, RouterOutlet, RouterLink, RouteParams, CanDeactivate}
  from 'angular2/router';
import {Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';
import {ModalService} from '../shared/modal/modal.service';
import {StoryModel} from './models/story.model';

import {HeroComponent}     from './directives/hero.component';
import {EditComponent}     from './directives/edit.component';
import {DecorateComponent} from './directives/decorate.component';
import {SellComponent}     from './directives/sell.component';

@Component({
  directives: [RouterLink, RouterOutlet, HeroComponent],
  selector: 'publish-story-edit',
  styleUrls: ['app/storyedit/storyedit.component.css'],
  template: `
    <publish-story-hero [title]="stepText" [story]="story"></publish-story-hero>
    <div class="main">
      <section>
        <div class="subnav">
          <nav *ngIf="!story.isNew">
            <a [routerLink]="['Default']">STEP 1: Edit your story</a>
            <a [routerLink]="['Decorate']">STEP 2: Decorate your story</a>
            <a [routerLink]="['Sell']">STEP 3: Sell your story</a>
          </nav>
          <nav *ngIf="story.isNew">
            <a [routerLink]="['Default']">STEP 1: Create your story</a>
            <a disabled>STEP 2: Decorate your story</a>
            <a disabled>STEP 3: Sell your story</a>
          </nav>
          <div class="extras">
            <button *ngIf="!story.isNew" class="delete" (click)="confirmDelete()">Delete</button>
          </div>
        </div>
        <div class="page">
          <router-outlet story="story"></router-outlet>
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

  private story: StoryModel;
  private stepText: string;
  private routerSub: Subscription;

  @ViewChild(EditComponent) private creator: EditComponent;
  @ViewChild(DecorateComponent) private decorator: DecorateComponent;
  @ViewChild(SellComponent) private seller: SellComponent;

  constructor(
    private cms: CmsService,
    private router: Router,
    private params: RouteParams,
    private modal: ModalService
  ) {
    this.story = new StoryModel(cms, params.params['id']);
    this.routerSub = <Subscription> this.router.parent.subscribe((path) => {
      this.setHeroText();
      this.bindRouteIO();
    });
  }

  setHeroText(): void {
    if (this.creator) {
      let verb = this.story.id ? 'Edit' : 'Create';
      this.stepText = `Step 1: ${verb} your Story!`;
    } else if (this.decorator) {
      this.stepText = 'Step 2: Decorate your Story!';
    } else {
      this.stepText = 'Step 3: Sell your Story!';
    }
  }

  // https://github.com/angular/angular/issues/4452
  bindRouteIO(): void {
    let active = (this.creator || this.decorator || this.seller);
    active.story = this.story;
  }

  ngOnDestroy(): any {
    this.routerSub.unsubscribe();
  }

  routerCanDeactivate(next: any, prev: any): Promise<boolean> {
    if (this.story.changed.any) {
      return new Promise<boolean>((resolve, reject) => {
        this.modal.prompt(
          'Discard changes?',
          'Your unsaved changes will be lost if you navigate away from this page',
          (okay: boolean) => { resolve(okay); }
        );
      });
    }
  }

}
