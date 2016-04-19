import {Component, Input} from 'angular2/core';
import {Router} from 'angular2/router';
import {StoryModel} from '../models/story.model';
import {SpinnerComponent}  from '../../shared/spinner/spinner.component';
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
        <spinner *ngIf="!story.isLoaded" inverse=true></spinner>
        <div class="info" *ngIf="story.isLoaded">
          <h2>{{story.title || '(Untitled)'}}</h2>
          <p *ngIf="story.updatedAt">Last saved at {{story.updatedAt | timeago}}</p>
        </div>
        <div class="actions">
          <button class="preview">Preview</button>
          <button *ngIf="story.isNew" class="create"
            [disabled]="story.invalid()"
            (click)="save()">Create</button>
          <button *ngIf="!story.isNew" class="save"
            [disabled]="story.invalid() || !story.changed()"
            (click)="save()">Save</button>
          <button *ngIf="!story.isNew" class="publish"
            [disabled]="story.invalid() || story.changed()">Publish</button>
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

}
