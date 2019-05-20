import { Component, DoCheck, Input } from '@angular/core';
import { StoryModel } from 'app/shared';
import { ToastrService, ModalService } from 'ngx-prx-styleguide';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'publish-status-control',
  template: `
    <ng-container *ngIf="story">
      <prx-button [model]="story" working=0 disabled=0 plain=1
        [visible]="isChanged" (click)="discard()">Discard</prx-button>

        <dl>
        <dt>Progress</dt>
        <dd *ngIf="!id">
          <p *ngIf="isChanged && !normalInvalid">Ready to create</p>
          <p *ngIf="isChanged && normalInvalid" class="error">Unable to create</p>
          <button *ngIf="isChanged && normalInvalid" class="btn-link"
            (click)="showProblems()">{{normalInvalidCount}}</button>
        </dd>
        <dd *ngIf="id">
          <ng-container *ngIf="strictInvalid">
            <p *ngIf="isPublished || normalInvalid" class="error">Invalid episode</p>
            <p *ngIf="notPublished && !normalInvalid">Not ready to publish</p>
            <button (click)="showProblems()" class="btn-link">{{strictInvalidCount}}</button>
          </ng-container>
          <ng-container *ngIf="notPublished && !strictInvalid">
            <p *ngIf="isChanged">Ready after save</p>
            <p *ngIf="!isChanged">Ready to publish</p>
          </ng-container>
          <ng-container *ngIf="isPublished && !strictInvalid">
            <p *ngIf="isChanged">Unsaved changes</p>
            <p *ngIf="!isChanged">Complete</p>
          </ng-container>
        </dd>
        </dl>
      <prx-button
        [model]="story"
        [visible]="isChanged || story.isNew"
        [disabled]="isInvalid"
        [dropdown]="!story.isNew"
        (click)="save()">
        Save
        <div class="dropdown-menu-items">
          <button *ngIf="id" class="delete" (click)="confirmDelete($event)">Delete</button>
        </div>
      </prx-button>

      <prx-button dropdown=1 *ngIf="!story.isNew" working=0 disabled=1 [visible]="!isChanged">
        Saved
        <div class="dropdown-menu-items">
          <button *ngIf="id" class="delete" (click)="confirmDelete($event)">Delete</button>
          <prx-button *ngIf="isPublished" [model]="story" visible=1 orange=1 disabled=0
            [working]="isPublishing" (click)="togglePublish()">Unpublish</prx-button>
        </div>
      </prx-button>
    </ng-container>
  `,
  styleUrls: ['./status-control.component.css']
})
export class StatusControlComponent implements DoCheck {
  @Input() id: number;
  @Input() story: StoryModel;

  isChanged: boolean;
  isInvalid: string;
  isPublished: boolean;
  isPublishing: boolean;
  normalInvalid: string;
  normalInvalidCount: string;
  strictInvalid: string;
  strictInvalidCount: string;
  notPublished: boolean;

  constructor(private modal: ModalService,
              private toastr: ToastrService,
              private router: Router,
              private angulartics2: Angulartics2) { }

  ngDoCheck() {
    if(this.story) {
      this.isPublished = this.story.publishedAt ? true : false;
      this.normalInvalid = this.storyInvalid(false);
      this.normalInvalidCount = this.countProblems(false);
      this.strictInvalid = this.storyInvalid(true);
      this.strictInvalidCount = this.countProblems(true);
      this.notPublished = !this.isPublished;
      this.isChanged = this.story.changed();
      if (this.story && (this.story.isNew || !this.story.publishedAt)) {
        this.isInvalid = this.story.invalid(null, false);
      } else {
        this.isInvalid = this.story.invalid(null, true); // strict
      }
    }
  }

  save() {
    let wasNew = this.story.isNew;
    this.story.save().subscribe(() => {
      this.toastr.success('Episode saved');
      if (wasNew) {
        this.router.navigate(['/story', this.story.id]);
      }
    });
  }

  discard() {
    this.story.discard();
  }

  togglePublish() {
    this.isPublishing = true;
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      this.angulartics2.eventTrack.next({ action: this.story.publishedAt ? 'publish' : 'unpublish',
        properties: { category: 'episode', label: 'episode/' + this.story.doc.id }});
      this.toastr.success(`Episode ${this.story.publishedAt ? 'published' : 'unpublished'}`);
      this.isPublishing = false;
    });
  }

  confirmDelete(event: MouseEvent): void {
    if (event.target['blur']) {
      event.target['blur']();
    }
    this.modal.confirm(
      'Really delete?',
      'Are you sure you want to delete this episode? This action cannot be undone.',
      (confirm: boolean) => {
        if (confirm) {
          if (this.story.changed()) {
            this.story.discard();
          }
          this.story.isDestroy = true;
          this.story.save().subscribe(() => {
            this.toastr.success('Episode deleted');
            this.router.navigate(['/']);
          });
        }
      }
    );
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
