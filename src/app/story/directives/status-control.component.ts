import { Component, DoCheck, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { interval } from 'rxjs';
import { skipWhile, mergeMap } from 'rxjs/operators';
import { StoryModel } from 'app/shared';
import { ToastrService, ModalService } from 'ngx-prx-styleguide';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { StoryStatus } from './status.component';

interface PublishBoxButton {
  text: string,
  action: Function,
  disabled?: boolean,
  color?: 'red' | 'orange' | 'green' | 'plain',
  icon?: string
}
@Component({
  selector: 'publish-status-control',
  template: `
    <hr>
    <div class="actions" *ngIf="story">
      <prx-button [model]="story" working=0 disabled=0 plain=1
        [visible]="isChanged || nextStatus !== currentStatus" (click)="discard()">Discard</prx-button>

      <prx-button *ngIf="buttons" #dropdownButton
        [model]="story"
        visible="true"
        [disabled]="buttons.primary.disabled"
        [working]="working"
        [red]="buttons.primary.color === 'red'"
        [orange]="buttons.primary.color === 'orange'"
        [green]="buttons.primary.color === 'green'"
        [dropdown]="buttons.secondary"
        (click)="buttons.primary.action()">
        {{ buttons.primary.text }}
        <div *ngIf="buttons.secondary" class="dropdown-menu-items">
          <button *ngIf="id" class="secondary" (click)="buttons.secondary.action($event)">
            {{ buttons.secondary.text }} <prx-icon [name]="buttons.secondary.icon" color="red" size="1em"></prx-icon>
          </button>
        </div>
      </prx-button>
    </div>
  `,
  styleUrls: ['./status-control.component.css']
})
export class StatusControlComponent implements DoCheck {
  @Input() id: number;
  @Input() story: StoryModel;
  @Input() nextStatus: StoryStatus;
  @Input() currentStatus: StoryStatus;
  @Output() status = new EventEmitter<StoryStatus>();
  @ViewChild('dropdownButton') dropdownButton: ElementRef;

  isChanged: boolean;
  hasPublishDate: boolean;
  isPublishing: boolean;
  normalInvalid: string;
  strictInvalid: string;
  buttons: {
    primary: PublishBoxButton,
    secondary?: PublishBoxButton
  };

  constructor(private modal: ModalService,
              private toastr: ToastrService,
              private router: Router,
              private angulartics2: Angulartics2) { }

  ngDoCheck() {
    if (this.story) {
      this.hasPublishDate = !!this.story.publishedAt;
      this.normalInvalid = this.storyInvalid(false);
      this.strictInvalid = this.storyInvalid(true);
      this.isChanged = this.story.changed();
      this.determineButtonActions();
    }
  }

  determineButtonActions() {
    switch (this.nextStatus) {
    //////////// DRAFT ////////////
    case 'draft':
      if (!this.isChanged || !this.normalInvalid) {
        if (this.currentStatus === 'scheduled') {
          // Scheduled to Draft
          this.buttons = {
            primary: {
              text: this.isChanged ? 'Save & Unschedule' : 'Unschedule',
              action: () => this.isChanged ? this.saveAndUnschedule() : this.unschedule(),
              disabled: false,
              color: 'orange'
            }
          }
        } else {
          this.buttons = {
            primary: {
              text: 'Save',
              action: () => this.save(),
              disabled: !this.isChanged,
              color: 'orange'
            }
          }
        }
      } else {
        this.buttons = {
          primary: {
            text: this.countProblems(false),
            action: () => this.showProblems(),
            disabled: false,
            color: 'red'
          }
        }
      }
      break;
    //////////// SCHEDULED ////////////
    case 'scheduled':
      if (this.strictInvalid) {
        this.buttons = {
          primary: {
            text: this.countProblems(true),
            action: () => this.showProblems(),
            disabled: false,
            color: 'red'
          }
        }
      } else {
        if (this.currentStatus === 'draft') {
          // promoting from Draft to Scheduled
          this.buttons = {
            primary: {
              text: 'Schedule',
              action: () => this.saveAndPublish('scheduled for publishing'),
              disabled: false,
              color: 'green'
            }
          }
        } else {
          // already scheduled
          this.buttons = {
            primary: {
              text: 'Save',
              action: () => this.save(),
              disabled: !this.isChanged,
              color: 'green'
            }
          }
        }
      }
      break;
    //////////// PUBLISHED ////////////
    case 'published':
      if (this.strictInvalid) {
        this.buttons = {
          primary: {
            text: this.countProblems(true),
            action: () => this.showProblems(),
            disabled: false,
            color: 'red'
          }
        }
      } else {
        if (this.currentStatus !== 'published') {
          this.buttons = {
            primary: {
              text: 'Publish Now',
              action: () => this.saveAndPublish('published'),
              disabled: false,
              // color: 'blue' // button default
            }
          }
        } else {
          // already published
          this.buttons = {
            primary: {
              text: 'Save & Publish',
              action: () => this.save(),
              disabled: !this.isChanged,
              // color: 'blue' // button default
            }
          }
        }
      }
      break;
    }

    // secondary button if !isNew
    if (this.id && this.buttons) {
      if (this.currentStatus !== 'published') {
        this.buttons.secondary = {
          text: 'Delete',
          action: (event) => this.confirmDelete(event),
          icon: 'trash'
        }
      } else {
        this.buttons.secondary = {
          text: 'Unpublish',
          action: (event) => this.unpublish(event),
          icon: 'cancel-circle'
        }
      }
    }
  }

  get working() {
    return this.story &&
      (this.story.isSaving || this.isPublishing ||
        (this.story.versions && this.story.versions.some(version => version.files.some(file => file.isProcessing || file.isUploading))));
  }

  save() {
    const wasNew = this.story.isNew;
    const releasedAtChanged = this.story.releasedAt && this.story.changed('releasedAt', false);
    this.story.save().subscribe(() => {
      if (releasedAtChanged && this.nextStatus === 'published' && this.story.releasedAt.valueOf() > Date.now().valueOf()) {
          this.status.emit('scheduled');
          this.toastr.success('Episode scheduled for publishing');
      } else if (releasedAtChanged && this.nextStatus === 'scheduled' && this.story.releasedAt.valueOf() < Date.now().valueOf()) {
          this.status.emit('published');
          this.toastr.success('Episode published');
      } else {
        this.toastr.success('Episode saved');
      }
      if (wasNew) {
        this.router.navigate(['/story', this.story.id]);
      }
    });
  }

  saveAndPublish(toast: string) {
    const wasNew = this.story.isNew;
    this.story.save().subscribe(() => {
      // a story should not publish while audio is processing
      if (this.story.versions.every(version => version.files.every(file => !file.isProcessing))) {
        this.togglePublish(toast);
      } else {
        const poll = interval(2000).pipe(
          mergeMap(() => this.story.doc.reload()),
          skipWhile(() => this.story.versions.some(version => version.files.some(file => file.isProcessing)))
        ).subscribe(() => {
          this.togglePublish(toast);
          if (wasNew) {
            this.router.navigate(['/story', this.story.id]);
          }
          poll.unsubscribe();
        })
      }
    });
  }

  saveAndUnschedule() {
    this.story.save().subscribe(() => {
      this.togglePublish('unscheduled');
    })
  }

  unschedule() {
    this.togglePublish('unscheduled');
  }

  discard() {
    this.status.emit(this.currentStatus);
    this.story.discard();
  }

  unpublish(event) {
    if (event.target['blur']) {
      event.target['blur']();
    }
    // #185 workaround for dropdown button causing primary click, also needs to close dropdown on click
    this.dropdownButton['onDropdownClick'](event);

    // confirm unpublish
    this.modal.confirm(
      'Are you sure?',
      'You do not need to unpublish the episode to update the content.',
      (confirm: boolean) => {
        if (confirm) {
          this.togglePublish('unpublished');
          this.status.emit('draft'); // updates the Status dropdown back to draft
        }
      }
    );
  }

  togglePublish(toast: string) {
    this.isPublishing = true;
    this.story.setPublished(!this.story.publishedAt).subscribe(() => {
      this.angulartics2.eventTrack.next({ action: this.story.publishedAt ? 'publish' : 'unpublish',
        properties: { category: 'episode', label: 'episode/' + this.story.doc.id }});
      this.toastr.success(`Episode ${toast}`);
      this.isPublishing = false;
    });
  }

  confirmDelete(event: MouseEvent): void {
    if (event.target['blur']) {
      event.target['blur']();
    }
    // #185 workaround for dropdown button
    this.dropdownButton['onDropdownClick'](event);
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
    const invalids = strict ? this.strictInvalid : this.normalInvalid;
    if (invalids) {
      return invalids.split(',').map(s => this.formatInvalid(s));
    } else {
      return [];
    }
  }

  countProblems(strict = false): string {
    const invalids = strict ? this.strictInvalid : this.normalInvalid;
    const count = invalids && invalids.split(',').length || 0;
    return count === 1 ? `Found 1 Problem` : `Found ${count} Problems`;
  }

  showProblems() {
    const normals = this.formatInvalids(false);
    const stricts = this.formatInvalids(true).filter(s => normals.indexOf(s) === -1);

    const title = 'Validation errors';
    let errors = [];
    normals.forEach(s => errors.push(`<li class="error">${s}</li>`));
    if (this.hasPublishDate || this.nextStatus !== 'draft') {
      stricts.forEach(s => errors.push(`<li class="error">${s}</li>`));
    }

    this.modal.show({title, body: `<ul>${errors.join('')}</ul>`, secondaryButton: 'Okay'});
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
