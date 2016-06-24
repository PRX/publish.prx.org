import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {StoryModel} from '../models/story.model';
import {SpinnerComponent} from '../../shared/spinner/spinner.component';
import {TimeAgoPipe} from '../../shared/date/timeago.pipe';

@Component({
  directives: [SpinnerComponent],
  pipes: [TimeAgoPipe],
  selector: 'publish-story-hero',
  styleUrls: ['app/storyedit/directives/hero.component.css'],
  template: `
    <div class="hero banner">
      <section>
        <h1>{{title}}</h1>
      </section>
    </div>
    <div class="hero toolbar" [class.affix]="affixed" (window:scroll)="onScroll()">
      <section>
        <spinner *ngIf="!story" inverse=true></spinner>
        <div class="info" *ngIf="story">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p *ngIf="story.isNew">Not saved</p>
          <p *ngIf="!story.isNew">Last saved at {{story.updatedAt | timeago}}</p>
        </div>
        <div class="actions" *ngIf="story">
          <button class="preview" [disabled]="story.isSaving">Preview</button>
          <button *ngIf="story.isNew" class="create" [class.saving]="story.isSaving"
            [disabled]="story.invalid() || story.isSaving"
            (click)="save()">Create <spinner *ngIf="story.isSaving"></spinner></button>
          <button *ngIf="!story.isNew" class="save" [class.saving]="story.isSaving"
            [disabled]="story.invalid() || !story.changed() || story.isSaving"
            (click)="save()">Save <spinner *ngIf="story.isSaving"></spinner></button>
          <button *ngIf="!story.isNew" class="publish"
            [disabled]="story.invalid() || story.changed() || story.isSaving"
            (click)="publish()">
            Publish
          </button>
        </div>
      </section>
    </div>
    <div class="spacer" [class.affix]="affixed"></div>
    `
})

export class HeroComponent {

  @Input() title: string;
  @Input() story: StoryModel;

  affixed = false;

  constructor(private router: Router) {}

  onScroll(): void {
    this.affixed = (window.scrollY > 200);
  }

  save(): void {
    let wasNew = this.story.isNew;
    this.story.save().subscribe(() => {
      if (wasNew) {
        this.router.navigate(['/edit', {id: this.story.id}]);
      }
    });
  }

}
