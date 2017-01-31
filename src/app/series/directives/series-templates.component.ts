import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '../../core';
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
      <publish-fancy-field label="Audio Templates">
        <div class="fancy-hint">
          When adding episodes to your series, you can have different versions of the audio for
          distribution. For example, it is common to have a podcast version of the audio broken
          into segments for ad injection, but also a broadcast version with different breaks for
          local news, different credits, or edits and bleeps to meet FCC permitted language requirements.
          On this page, you can define basic templates for the versions of audio that will be expected for
          each episode in this series, as well as requirements for each of those templates.
        </div>
        <button *ngIf="!hasVersions()" class="add-version"
          (click)="addVersion()"><i class="icon-plus"></i>Add a template</button>
      </publish-fancy-field>

      <template ngFor let-v [ngForOf]="series.versionTemplates">
        <div *ngIf="!v.isDestroy" class="version">
          <header>
            <strong>{{v?.label}}</strong>
            <button type="button" class="btn-icon icon-cancel" (click)="promptToRemoveVersion(v)"></button>
          </header>
          <section>
            <publish-fancy-field required textinput [model]="v" name="label" label="Template Label">
              <div class="fancy-hint">A name for this audio template, such as "Podcast Audio" or "Clean Version"</div>
            </publish-fancy-field>

            <publish-fancy-field class="length" [model]="v" label="Total length" invalid="lengthAny">
              <div class="fancy-hint">
                The minimum and maximum HH:MM:SS durations for all the audio files. Used to ensure that each
                of your episodes is the desired approximate length, and to prevent uploading bad audio.
              </div>
              <publish-fancy-duration [model]="v" name="lengthMinimum" label="Minimum"
                [advancedConfirm]="lengthConfirm(v, v['lengthMinimum'] | duration, 'minimum')"></publish-fancy-duration>
              <publish-fancy-duration [model]="v" name="lengthMaximum" label="Maximum"
                [advancedConfirm]="lengthConfirm(v, v['lengthMaximum'] | duration, 'maximum')"></publish-fancy-duration>
            </publish-fancy-field>

            <publish-fancy-field label="Segments">
              <div class="fancy-hint">
                Describe the individual segment audio files required in this template. Give
                them a label such as "Billboard" or "Part A", and an optional min/max length
                to validate the specific file.
              </div>
              <publish-file-template *ngFor="let t of v.fileTemplates" [file]="t" [version]="v"></publish-file-template>
              <button tabindex=-1 class="add-segment" *ngIf="canAddFile(v)" type="button"
                (click)="promptToAddFile(v)"><i class="icon-plus"></i>Add Segment</button>
            </publish-fancy-field>
          </section>
        </div>
      </template>
    </form>
  `
})

export class SeriesTemplatesComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService,
              private modal: ModalService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.series = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  hasStories() {
    return this.series && this.series.doc && this.series.doc.has('prx:stories') && this.series.doc.count('prx:stories') > 0;
  }

  hasVersions() {
    return this.series.versionTemplates.some(f => !f.isDestroy);
  }

  addVersion() {
    let draft = new AudioVersionTemplateModel(this.series.doc);
    draft.set('label', 'Podcast Audio');
    this.series.versionTemplates.push(draft);
  }

  promptToRemoveVersion(version: AudioVersionTemplateModel) {
    if (this.hasStories()) {
      let confirmMsg = `Are you sure you want to remove the ${version.label} template?
      This change could affect your already published episodes.`;
      this.modal.prompt('', confirmMsg, (confirm) => {
        if (confirm) {
          this.removeVersion(version);
        }
      });
    } else {
      this.removeVersion(version);
    }
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

  promptToAddFile(version: AudioVersionTemplateModel) {
    if (this.hasStories()) {
      let confirmMsg = `Are you sure you want to add a segment to your ${version.label} template?
      This change could invalidate your already published episodes.`;
      this.modal.prompt('', confirmMsg, (confirm) => {
        if (confirm) {
          this.addFile(version);
        }
      });
    } else {
      this.addFile(version);
    }
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

  lengthConfirm(version: AudioVersionTemplateModel, value: string, label: string): string {
    if (this.hasStories() &&
      (version.lengthMinimum > version.original['lengthMinimum'] ||
      (version.lengthMaximum !== 0 && version.lengthMaximum < version.original['lengthMaximum']))) {
      return `Are you sure you want to use ${value} as the ${label} length for all audio for your ${version.label} template?
        This change could invalidate your already published episodes.`;
    }
  }

}
