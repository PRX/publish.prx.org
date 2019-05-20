import { Component, DoCheck, Input } from '@angular/core';
import { StoryModel } from 'app/shared';
import { ToastrService, ModalService } from 'ngx-prx-styleguide';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'publish-status-control',
  template: `
    <ng-container *ngIf="story">
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

      <prx-button [model]="story" working=0 disabled=0 plain=1
        [visible]="isChanged" (click)="discard()">Discard</prx-button>

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

  constructor(private modal: ModalService,
              private toastr: ToastrService,
              private router: Router,
              private angulartics2: Angulartics2) { }

  ngDoCheck() {
    if(this.story) {
      this.isPublished = this.story.publishedAt ? true : false;
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
}
