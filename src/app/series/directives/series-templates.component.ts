import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalService, TabService } from 'ngx-prx-styleguide';
import {
  SeriesModel,
  AudioVersionTemplateModel,
  AudioFileTemplateModel
} from '../../shared';

@Component({
  styleUrls: ['series-templates.component.css'],
  templateUrl: 'series-templates.component.html'
})

export class SeriesTemplatesComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService, private modal: ModalService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  hasStories(): boolean {
    return this.series && this.series.hasStories;
  }

  hasVersions(): boolean {
    return !!this.series.versionTemplates.some(f => !f.isDestroy);
  }

  hasDefaultVersion(): boolean {
    let t = this.series.versionTemplates[0];
    return t && t.isNew && !t.changed();
  }

  addVersion() {
    let draft = new AudioVersionTemplateModel(this.series.doc, this.series.versionTemplates.length);
    if (this.hasDefaultVersion()) {
      this.series.versionTemplates[0].set('label', 'Default Podcast Audio');
      draft.set('label', 'Some Other Audio');
    } else if (this.hasVersions()) {
      draft.set('label', 'Some Other Audio');
    } else {
      draft.set('label', 'Podcast Audio');
    }
    this.series.versionTemplates.push(draft);
  }

  confirmRemoveVersion(version: AudioVersionTemplateModel) {
    if (this.hasStories() && !version.isNew) {
      let confirmMsg = `Are you sure you want to remove the ${version.label} template?
      This change could affect your already published episodes.`;
      this.modal.confirm('', confirmMsg, (confirm) => {
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

  confirmAddFile(event: MouseEvent, version: AudioVersionTemplateModel) {
    if (event.target['blur']) {
      event.target['blur']();
    }
    if (this.hasStories() && !version.isNew) {
      let confirmMsg = `Are you sure you want to add a segment to your ${version.label} template?
      This change could invalidate your already published episodes.`;
      this.modal.confirm('', confirmMsg, (confirm) => {
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

  isLengthMoreStrict(version: AudioVersionTemplateModel) {
    return (version.lengthMinimum > version.original['lengthMinimum'] ||
    (version.lengthMaximum !== 0 && version.lengthMaximum < version.original['lengthMaximum']));
  }

  lengthConfirm(version: AudioVersionTemplateModel, value: string, label: string): string {
    if (this.hasStories() && this.isLengthMoreStrict(version)) {
      return `Are you sure you want to use ${value} as the ${label} length for all audio for your ${version.label} template?
        This change could invalidate your already published episodes.`;
    }
  }

}
