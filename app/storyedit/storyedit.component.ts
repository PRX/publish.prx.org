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
    <div class="hero toolbar" [class.affix]="affix" (window:scroll)="onScroll()">
      <section>
        <spinner *ngIf="!story.isLoaded" inverse=true></spinner>
        <div class="info" *ngIf="story.isLoaded">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p *ngIf="story.modifiedAt">Last saved at {{story.modifiedAt | date}}</p>
        </div>
        <div class="actions">
          <button class="preview">Preview</button>
          <button *ngIf="!story.id" class="create"
            [disabled]="!story.isValid"
            (click)="save()">Create</button>
          <button *ngIf="story.id" class="save"
            [disabled]="!story.isValid || !story.isChanged"
            (click)="save()">Save</button>
          <button *ngIf="story.id" class="publish"
            [disabled]="!story.isValid || story.isChanged">Publish</button>
        </div>
      </section>
    </div>
    <div class="main" [class.deffix]="affix">
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
  private affix = false;

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

  onScroll(): void {
    this.affix = (window.scrollY > 200);
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
    // if (this.subs) { this.subs.unsubscribe(); this.subs = null; }
    // this.subs = active.customEvent1.subscribe(m=>this.processCustomEvent(m));
  }

  save(): void {
    this.story.save().subscribe((isNew) => {
      if (isNew) {
        this.router.parent.navigate(['Edit', {id: this.story.id}]);
      }
    });
  }

  confirmDelete(): void {
    if (confirm('Are you sure you want to delete this story?')) {
      this.story.destroy().subscribe(() => {
        this.router.parent.navigate(['Home']);
      });
    }
  }

  ngOnDestroy(): any {
    this.routerSub.unsubscribe();
  }

}
