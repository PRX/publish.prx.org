import { Component, Input, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';
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
        <ng-container *ngIf="isPublished">
          <button *ngIf="editStatus" class="btn-link edit-status" (click)="toggleEdit()">Hide</button>
          <button *ngIf="!editStatus" class="btn-link edit-status" (click)="toggleEdit()">Edit</button>
          <prx-button *ngIf="editStatus" [model]="story" visible=1 orange=1 disabled=0
            [working]="isPublishing" (click)="togglePublish()">Unpublish</prx-button>
        </ng-container>
      </dd>

      <dt *ngIf="isPublished && isScheduled">Publishing</dt>
      <dt *ngIf="isPublished && !isScheduled">Published</dt>
      <dd *ngIf="isPublished"><p>{{story.publishedAt | date:"short"}}</p></dd>

      <dt>Saved</dt>
      <dd *ngIf="!id"><p>Not Saved</p></dd>
      <dd *ngIf="id"><p *ngIf="story?.updatedAt">{{story.updatedAt | date:"short"}}</p></dd>

      <dt>Progress</dt>
      <dd *ngIf="!id">
        <p *ngIf="changed && !normalInvalid">Ready to create</p>
        <p *ngIf="changed && normalInvalid" class="error">Unable to create</p>
        <button *ngIf="changed && normalInvalid" class="btn-link"
          (click)="showProblems()">{{normalInvalidCount}}</button>
      </dd>
      <dd *ngIf="id">
        <ng-container *ngIf="strictInvalid">
          <p *ngIf="isPublished || normalInvalid" class="error">Invalid episode</p>
          <p *ngIf="notPublished && !normalInvalid">Not ready to publish</p>
          <button (click)="showProblems()" class="btn-link">{{strictInvalidCount}}</button>
        </ng-container>
        <ng-container *ngIf="notPublished && !strictInvalid">
          <p *ngIf="changed">Ready after save</p>
          <p *ngIf="!changed">Ready to publish</p>
          <prx-button [model]="story" visible=1 orange=1 [disabled]="changed"
            [working]="isPublishing" (click)="togglePublish()">Publish</prx-button>
        </ng-container>
        <ng-container *ngIf="isPublished && !strictInvalid">
          <p *ngIf="changed">Unsaved changes</p>
          <p *ngIf="!changed">Complete</p>
        </ng-container>
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

  constructor(private modal: ModalService,
              private toastr: ToastrService,
              private router: Router,
              private angulartics2: Angulartics2) {}

  ngDoCheck() {
    if (this.story) {
      this.setStatus();
      this.isPublished = this.story.publishedAt ? true : false;
      this.isScheduled = this.isPublished && !this.story.isPublished();
      this.notPublished = !this.isPublished;
      this.normalInvalid = this.storyInvalid(false);
      this.normalInvalidCount = this.countProblems(false);
      this.strictInvalid = this.storyInvalid(true);
      this.strictInvalidCount = this.countProblems(true);
      this.changed = this.story.changed();
    }
  }

  setStatus() {
    if (this.story.isNew || !this.story.publishedAt) {
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

    this.modal.show({title: title, body: `<ul>${msg}</ul>`, secondaryButton: 'Okay'});
  }

  toggleEdit() {
    this.editStatus = !this.editStatus;
  }

  togglePublish() {
    this.isPublishing = true;
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      this.angulartics2.eventTrack.next({ action: this.story.publishedAt ? 'publish' : 'unpublish',
        properties: { category: 'episode', label: 'episode/' + this.story.doc.id }});
      this.toastr.success(`Episode ${this.story.publishedAt ? 'published' : 'unpublished'}`);
      this.isPublishing = false;
      this.editStatus = false;
    });
  }

  private storyInvalid(strict): string {
    let invalids = this.story.invalid(null, strict);
    if (invalids || this.story.status !== 'invalid') {
      return invalids;
    } else if (strict && !this.story.changed()) {
      return this.story.statusMessage;
    } else {
      return null;
    }
  }

}
