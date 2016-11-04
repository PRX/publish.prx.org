import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  SeriesModel,
  TabService,
  AudioVersionTemplateModel,
  AudioFileTemplateModel
} from '../../shared';

@Component({
  styleUrls: ['series-templates.component.css'],
  template: `
    <form *ngIf="series">

      <template ngFor let-v [ngForOf]="series.versionTemplates">
        <div *ngIf="!v.isDestroy" class="version">
          <publish-fancy-field textinput required [model]="v" name="label" label="Version Label">
            <div class="actions">
              <a (click)="removeVersion(v)"><i class="icon-cancel"></i>Remove Template</a>
            </div>
          </publish-fancy-field>

          <publish-fancy-field class="length" [model]="v" label="Total length in seconds" invalid="lengthAny">
            <publish-fancy-field number small inline hideinvalid [model]="v" name="lengthMinimum" label="Minimum">
            </publish-fancy-field>
            <publish-fancy-field number small inline hideinvalid [model]="v" name="lengthMaximum" label="Maximum">
            </publish-fancy-field>
          </publish-fancy-field>

          <publish-fancy-field label="Audio Segments">
            <div class="actions">
              <a *ngIf="canAddFile(v)" (click)="addFile(v)"><i class="icon-plus"></i>Add Segment</a>
              <a *ngIf="canRemoveFile(v)" (click)="removeFile(v)"><i class="icon-cancel"></i>Remove Segment</a>
            </div>
            <publish-file-template *ngFor="let t of v.fileTemplates" [file]="t">
            </publish-file-template>
            <div *ngIf="!canRemoveFile(v)" class="empty">
              <h4>No segments defined</h4>
            </div>
          </publish-fancy-field>
        </div>
      </template>

      <div *ngIf="!hasVersions()">
        <publish-fancy-field label="No Templates">
          <div class="fancy-hint">You have no templates defined for your series.
            Defining a template can help validate that your audio has the correct
            duration and number of segments.</div>
          <button class="add-version" (click)="addVersion()"><i class="icon-plus"></i> Create a template</button>
        </publish-fancy-field>
      </div>

    </form>
  `
})

export class SeriesTemplatesComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.series = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  hasVersions() {
    return this.series.versionTemplates.some(f => !f.isDestroy);
  }

  addVersion() {
    let draft = new AudioVersionTemplateModel(this.series.doc);
    draft.set('label', 'Podcast Audio');
    this.series.versionTemplates.push(draft);
  }

  removeVersion(version: AudioVersionTemplateModel) {
    version.isDestroy = true;
    if (version.isNew) {
      this.series.versionTemplates.splice(this.series.versionTemplates.indexOf(version), 1);
      version.unstore();
    }
  }

  canAddFile(version: AudioVersionTemplateModel): boolean {
    return version.fileTemplates.filter(f => !f.isDestroy).length < 10;
  }

  canRemoveFile(version: AudioVersionTemplateModel): boolean {
    return version.fileTemplates.some(f => !f.isDestroy);
  }

  addFile(version: AudioVersionTemplateModel) {
    let existing = version.fileTemplates.find(f => f.isDestroy);
    if (existing) {
      existing.isDestroy = false;
    } else {
      let count = version.fileTemplates.length;
      let segLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[count % 26];
      let draft = new AudioFileTemplateModel(version.parent, version.doc, count + 1);
      draft.set('label', `Segment ${segLetter}`);
      version.fileTemplates.push(draft);
    }
  }

  removeFile(version: AudioVersionTemplateModel) {
    let last = version.fileTemplates.filter(f => !f.isDestroy).pop();
    if (last) {
      last.isDestroy = true;
      if (last.isNew) {
        version.fileTemplates.splice(version.fileTemplates.indexOf(last), 1);
        last.unstore();
      }
    }
  }

}
