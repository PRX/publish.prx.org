import { Component, Input, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../core';
import { StoryModel } from '../../shared';

@Component({
  selector: 'publish-story-status',
  styleUrls: ['status.component.css'],
  template: `
    <h1>Publish</h1>
    <dl>

      <dt>Status</dt>
      <dd>
        <span [class]="statusClass">{{statusText}}</span>
        <template [ngIf]="isPublished">
          <button *ngIf="editStatus" class="btn-link edit-status" (click)="toggleEdit()">Hide</button>
          <button *ngIf="!editStatus" class="btn-link edit-status" (click)="toggleEdit()">Edit</button>
          <publish-button *ngIf="editStatus" [model]="story" visible=1 orange=1 disabled=0
            [working]="isPublishing" (click)="togglePublish()">Unpublish</publish-button>
          <publish-button *ngIf="editStatus" [model]="story" visible=1 red=1 disabled=0 working=0
            (click)="confirmDelete()">Delete</publish-button>
        </template>
      </dd>

      <dt *ngIf="isPublished && isScheduled">Publishing</dt>
      <dt *ngIf="isPublished && !isScheduled">Published</dt>
      <dd *ngIf="isPublished"><p>{{story.publishedAt | date:"short"}}</p></dd>

      <dt>Saved</dt>
      <dd *ngIf="!id"><p>Not Saved</p></dd>
      <dd *ngIf="id"><p *ngIf="story?.updatedAt">{{story.updatedAt | date:"short"}}</p></dd>

      <dt>Progress</dt>
      <dd *ngIf="!id">
        <p *ngIf="!normalInvalid">Ready to create</p>
        <p *ngIf="normalInvalid" class="error">Unable to create</p>
        <button *ngIf="normalInvalid" (click)="showProblems()" class="btn-link">{{normalInvalidCount}}</button>
      </dd>
      <dd *ngIf="id">
        <template [ngIf]="strictInvalid">
          <p *ngIf="isPublished || normalInvalid" class="error">Invalid episode</p>
          <p *ngIf="notPublished && !normalInvalid">Not ready to publish</p>
          <button (click)="showProblems()" class="btn-link">{{strictInvalidCount}}</button>
        </template>
        <template [ngIf]="notPublished && !strictInvalid">
          <p *ngIf="changed">Ready after save</p>
          <p *ngIf="!changed">Ready to publish</p>
          <publish-button [model]="story" visible=1 orange=1 [disabled]="changed"
            [working]="isPublishing" (click)="togglePublish()">Publish</publish-button>
        </template>
        <template [ngIf]="isPublished && !strictInvalid">
          <p *ngIf="changed">Unsaved changes</p>
          <p *ngIf="!changed">Complete</p>
        </template>
      </dd>

    </dl>
  `
})

export class StoryStatusComponent implements DoCheck {

  @Input() id: number;
  @Input() story: StoryModel;

  statusClass: string;
  statusText: string;
  isPublished: boolean;
  isScheduled: boolean;
  notPublished: boolean;

  normalInvalid: string;
  normalInvalidCount: string;
  strictInvalid: string;
  strictInvalidCount: string;
  changed: boolean;
  editStatus: boolean;
  isPublishing: boolean;

  constructor(private modal: ModalService, private router: Router) {}

  ngDoCheck() {
    if (this.story) {
      this.setStatus();
      this.isPublished = this.story.publishedAt ? true : false;
      this.isScheduled = this.isPublished && !this.story.isPublished();
      this.notPublished = !this.isPublished;
      this.normalInvalid = this.story.invalid(null, false);
      this.normalInvalidCount = this.countProblems(false);
      this.strictInvalid = this.story.invalid(null, true);
      this.strictInvalidCount = this.countProblems(true);
      this.changed = this.story.changed();
    }
  }

  setStatus() {
    if (this.story.isNew) {
      this.statusClass = 'status new';
      this.statusText = 'New';
    } else if (!this.story.publishedAt) {
      this.statusClass = 'status draft';
      this.statusText = 'Draft';
    } else if (!this.story.isPublished()) {
      this.statusClass = 'status scheduled';
      this.statusText = 'Scheduled';
    } else {
      this.statusClass = 'status published';
      this.statusText = 'Published';
    }
  }

  formatInvalid(str: string): string {
    str = str.trim();
    str = str.replace(/shortdescription/i, 'teaser');
    str = str.charAt(0).toUpperCase() + str.slice(1);
    return str;
  }

  formatInvalids(strict = false): string[] {
    let invalids = strict ? this.strictInvalid : this.normalInvalid;
    if (invalids) {
      return invalids.split(',').map(s => this.formatInvalid(s));
    } else {
      return [];
    }
  }

  countProblems(strict = false): string {
    let count = this.formatInvalids(strict).length;
    return count === 1 ? `Found 1 problem` : `Found ${count} problems`;
  }

  showProblems() {
    let normals = this.formatInvalids(false);
    let stricts = this.formatInvalids(true).filter(s => normals.indexOf(s) === -1);

    let title = 'Validation errors';
    let msg = '';
    normals.forEach(s => msg += `<li class="error">${s}</li>`);
    if (this.isPublished) {
      stricts.forEach(s => msg += `<li class="error">${s}</li>`);
    }
    if (this.id && !this.isPublished) {
      stricts.forEach(s => msg += `<li>${s}</li>`);
      if (normals.length === 0) {
        title = 'Not ready to publish';
      }
    }

    this.modal.show({title: title, body: `<ul>${msg}</ul>`, buttons: ['Okay']});
  }

  toggleEdit() {
    this.editStatus = !this.editStatus;
  }

  togglePublish() {
    this.isPublishing = true;
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      this.isPublishing = false;
    });
  }

  confirmDelete(): void {
    this.modal.prompt(
      'Really delete?',
      'Are you sure you want to delete this episode?  This action cannot be undone.',
      (okay: boolean) => {
        if (okay) {
          this.story.discard();
          this.story.isDestroy = true;
          this.story.save().subscribe(() => {
            this.router.navigate(['/']);
          });
        }
      }
    );
  }

}
