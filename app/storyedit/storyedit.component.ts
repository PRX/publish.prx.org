import {Component, OnDestroy, ViewChild} from 'angular2/core';
import {Router, RouteConfig, RouterOutlet, RouterLink} from 'angular2/router';
import {Subscription} from 'rxjs';

import {CmsService} from '../shared/cms/cms.service';

import {SpinnerComponent}  from '../shared/spinner/spinner.component';
import {CreateComponent}   from './directives/create.component';
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
        <spinner *ngIf="!storyDoc" inverse=true></spinner>
        <div class="info" *ngIf="storyDoc">
          <h2>{{storyDoc.title}}</h2>
          <p>Last saved at {{storyDoc.publishedAt | date}}</p>
        </div>
        <div class="actions">
          <button class="preview">Preview</button>
          <button class="save">Save</button>
          <button class="publish">Publish</button>
        </div>
      </section>
    </div>
    <div class="main">
      <section>
        <nav>
          <a [routerLink]="['Default']">STEP 1: Create your story</a>
          <a [routerLink]="['Decorate']">STEP 2: Decorate your story</a>
          <a [routerLink]="['Sell']">STEP 3: Sell your story</a>
        </nav>
        <div class="page">
          <router-outlet></router-outlet>
        </div>
      </section>
    </div>
    `
})

@RouteConfig([
  { path: '/',         name: 'Default',  component: CreateComponent, useAsDefault: true },
  { path: '/decorate', name: 'Decorate', component: DecorateComponent },
  { path: '/sell',     name: 'Sell',     component: SellComponent }
])

export class StoryEditComponent implements OnDestroy {

  private storyDoc: Object;
  private stepText: string;
  private routerSub: Subscription;

  @ViewChild(CreateComponent) private creator: CreateComponent;
  @ViewChild(DecorateComponent) private decorator: DecorateComponent;
  @ViewChild(SellComponent) private seller: SellComponent;

  constructor(private cms: CmsService, private router: Router) {

    // TODO: this will load a doc for edit-mode
    this.storyDoc = {
      id: 9999,
      title: 'Test story title',
      shortDescription: 'This is the short description',
      episodeNumber: 9999,
      episodeIdentifier: 'episode#1',
      publishedAt: '2016-01-16T14:25:00.000Z',
      duration: 999,
      points: 99,
      appVersion: 'v3',
      description: 'This is the long description',
      tags: [],
      license: {
        streamable: true,
        editable: false
      }
    };
    this.storyDoc['publishedAt'] = new Date(this.storyDoc['publishedAt']);

    this.routerSub = <Subscription> this.router.parent.subscribe((path) => {
      if (this.creator) {
        this.stepText = 'Step 1: Create your Story!';
      }
      if (this.decorator) {
        this.stepText = 'Step 2: Decorate your Story!';
      }
      if (this.seller) {
        this.stepText = 'Step 3: Sell your Story!';
      }
    });
  }

  ngOnDestroy(): any {
    this.routerSub.unsubscribe();
  }

}
