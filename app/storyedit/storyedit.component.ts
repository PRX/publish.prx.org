import {Component, OnDestroy, ViewChild} from 'angular2/core';
import {Router, RouteConfig, RouterOutlet, RouterLink, RouteParams} from 'angular2/router';
import {Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';
import {StoryModel} from './models/story.model';

import {SpinnerComponent}  from '../shared/spinner/spinner.component';
import {EditComponent}   from './directives/edit.component';
import {DecorateComponent} from './directives/decorate.component';
import {SellComponent}     from './directives/sell.component';

@Component({
  directives: [RouterLink, SpinnerComponent, RouterOutlet],
  selector: 'publish-story-new',
  styleUrls: ['app/storyedit/storyedit.component.css'],
  template: `
    <div class="hero banner">
      <section>
        <h1>{{stepText}}</h1>
      </section>
    </div>
    <div class="hero toolbar">
      <section>
        <spinner *ngIf="!story.isLoaded" inverse=true></spinner>
        <div class="info" *ngIf="story.isLoaded">
          <h2>{{story.title}}</h2>
          <p *ngIf="story.modifiedAt">Last saved at {{story.modifiedAt | date}}</p>
        </div>
        <div class="actions">
          <button class="preview">Preview</button>
          <button *ngIf="!story.id" class="create">Create</button>
          <button *ngIf="story.id" class="save">Save</button>
          <button *ngIf="story.id" class="publish">Publish</button>
        </div>
      </section>
    </div>
    <div class="main">
      <section>
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
      if (this.creator) {
        let verb = this.story.id ? 'Edit' : 'Create';
        this.stepText = `Step 1: ${verb} your Story!`;
        this.creator.story = this.story;
      }
      if (this.decorator) {
        this.stepText = 'Step 2: Decorate your Story!';
        this.decorator.story = this.story;
      }
      if (this.seller) {
        this.stepText = 'Step 3: Sell your Story!';
        this.seller.story = this.story;
      }
    });
  }

  ngOnDestroy(): any {
    this.routerSub.unsubscribe();
  }

}
