import {Component, OnDestroy, ViewChild} from 'angular2/core';
import {Router, RouteConfig, RouterOutlet, RouterLink, RouteParams} from 'angular2/router';
import {Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';
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
          <nav *ngIf="story.id">
            <a [routerLink]="['Default']">STEP 1: Edit your story</a>
            <a [routerLink]="['Decorate']">STEP 2: Decorate your story</a>
            <a [routerLink]="['Sell']">STEP 3: Sell your story</a>
          </nav>
          <nav *ngIf="!story.id">
            <a [routerLink]="['Default']">STEP 1: Create your story</a>
            <a disabled>STEP 2: Decorate your story</a>
            <a disabled>STEP 3: Sell your story</a>
          </nav>
          <div class="extras">
            <button *ngIf="story.id" class="delete" (click)="confirmDelete()">Delete</button>
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

export class StoryEditComponent implements OnDestroy {

  private story: StoryModel;
  private stepText: string;
  private routerSub: Subscription;

  @ViewChild(EditComponent) private creator: EditComponent;
  @ViewChild(DecorateComponent) private decorator: DecorateComponent;
  @ViewChild(SellComponent) private seller: SellComponent;

  constructor(
    private cms: CmsService,
    private router: Router,
    private params: RouteParams
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

}
