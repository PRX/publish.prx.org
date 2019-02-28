import { Component, OnDestroy, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, AudioVersionModel } from '../../shared';
import { HalDoc, ModalService, TabService } from 'ngx-prx-styleguide';

@Component({
  styleUrls: ['basic.component.css'],
  template: `
    <form *ngIf="story">

      <prx-fancy-field textinput required [model]="story" name="title" label="Title">
        <div class="fancy-hint">Write a short, Tweetable title. Think newspaper headline.</div>
      </prx-fancy-field>

      <prx-fancy-field textinput [model]="story" name="cleanTitle" label="Clean Title">
        <div class="fancy-hint">
          If the title above contains any extraneous identifying information about
          your episode (like season number), provide a clean version of the title alone here.
        </div>
      </prx-fancy-field>

      <prx-fancy-field textinput required [model]="story" name="shortDescription" label="Teaser" [strict]="strict">
        <div class="fancy-hint">Provide a short description for your episode listing.
        Think of this as a first impression for your listeners.</div>
      </prx-fancy-field>

      <prx-fancy-field label="Description">
        <div class="fancy-hint">
          Write a full description of your episode, including keywords, names of interviewees, places and topics.
          Feel free to incorporate links, images, and any of the other provided rich text formatting options.
        </div>
      <publish-wysiwyg [model]="story" name="description" [content]="story.description" [images]="story.images"
        [changed]="descriptionChanged"></publish-wysiwyg>
      </prx-fancy-field>

      <hr/>

      <prx-fancy-field required label="Audio Files">
        
        <prx-select
          *ngIf="versionTemplateOptions" class="file-select"  placeholder="Select Templates..."
          [selected]="versionTemplatesSelected" [options]="versionTemplateOptions"
          (onSelect)="updateVersions($event)" [maxSelectedItems]="1"
          [class.invalid]="versionsInvalid"
          [class.changed]="versionsChanged"></prx-select>
        <prx-spinner *ngIf="!undeletedVersions"></prx-spinner>
        <publish-upload *ngFor="let v of undeletedVersions" [version]="v" [strict]="strict"></publish-upload>
        <div *ngIf="undeletedVersions?.length === 0" class="fancy-hint">
          Pick at least one version of your audio files to upload for this episode.
        </div>
        <div *ngIf="undeletedVersions?.length > 0" class="fancy-hint">
          Clear your selection to select another template
        </div>
      </prx-fancy-field>

      <prx-fancy-field label="Cover Image">
      <div class="fancy-hint">Provide an image for your episode, if desired. Image dimensions must be square.</div>
        <publish-image-upload [model]="story"
          minWidth=1400 minHeight=1400
          maxWidth=3000 maxHeight=3000
          square="true" [strict]="strict">
        </publish-image-upload>
      </prx-fancy-field>

      <hr/>

      <prx-fancy-field textinput [model]="story" name="tags" label="Categories" [strict]="strict">
        <div class="fancy-hint">A comma-separated list of tags relevant to the content of your episode.</div>
      </prx-fancy-field>

      <prx-fancy-field label="Season and Episode Numbers">
        <div class="fancy-hint">If your episode is part of a season or has a specific episode number, select those numbers here.</div>

        <div class="number-fields">
          <prx-fancy-field number label="Season Number" [model]="story" name="seasonNumber" small=1>
          </prx-fancy-field>

          <prx-fancy-field number label="Episode Number" [model]="story" name="episodeNumber" small=1>
          </prx-fancy-field>
        </div>
      </prx-fancy-field>

      <prx-fancy-field label="Release Date">
        <div class="fancy-hint">
          <input type="checkbox" [ngModel]="showReleasedAt" (click)="toggleShowReleaseAt()" name="showReleasedAt" id="showReleasedAt">
          <label for="showReleasedAt">Specify date and time to be published</label>
        </div>
        <div class="fancy-hint" *ngIf="showReleasedAt">If you'd like to manually alter this episode's publication
        to either delay or back-date its release, select the desired release date and time here.
        Otherwise, the episode will be released immediately once published.
        </div>
        <prx-datepicker *ngIf="showReleasedAt"
          [date]="story.releasedAt" (dateChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
        </prx-datepicker>
        <prx-timepicker *ngIf="showReleasedAt"
          [date]="story.releasedAt" (timeChange)="story.set('releasedAt', $event)" [changed]="releasedAtChanged">
        </prx-timepicker>
      </prx-fancy-field>

    </form>
  `
})

export class BasicComponent implements OnDestroy, DoCheck {

  story: StoryModel;
  tabSub: Subscription;
  showReleasedAt = false;
  versionTemplates: { [id: number]: HalDoc; };
  versionTemplatesSelected: number[];
  versionTemplateOptions: string[][];

  constructor(
    tab: TabService,
    private modal: ModalService,
) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      this.loadVersionTemplates();
    });
  }

  ngDoCheck() {
    if (this.story && this.story.releasedAt) {
      this.showReleasedAt = true;
    }
    if (this.story && this.story.versions && this.versionTemplatesSelected) {
      this.setSelected();
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  get descriptionChanged(): boolean {
    return this.story && this.story.changed('description', false);
  }

  get releasedAtChanged(): boolean {
    return this.story && this.story.changed('releasedAt', false);
  }

  get strict(): boolean {
    return (this.story && this.story.publishedAt) ? true : false;
  }

  get undeletedVersions(): AudioVersionModel[] {
    if (this.story && this.story.versions) {
      return this.story.versions.filter(v => !v.isDestroy);
    } else {
      return null;
    }
  }

  get versionsChanged(): boolean {
    return this.story && this.story.changed('versions', true);
  }

  get versionsInvalid(): boolean {
    return this.story && !!this.story.invalid('versions', this.strict);
  }

  updateVersions(templateIds: number[]) {
    let used = {};
    this.story.versions.forEach(v => {
      if (v.template) {
        used[v.template.id] = true;
        if (templateIds.indexOf(v.template.id) > -1) {
          v.isDestroy = false;
        } else if (v.isNew) {
          this.story.removeRelated(v);
        } else {
          v.isDestroy = true;
          (v.files || []).forEach(f => f.isDestroy = false);
        }
      }
    });
    templateIds.forEach(id => {
      if (!used[id] && this.versionTemplates[id]) {
        this.story.versions.push(new AudioVersionModel({
          series: this.story.parent,
          template: this.versionTemplates[id]
        }));
      }
    });
  }

  toggleShowReleaseAt() {
    this.showReleasedAt = !this.showReleasedAt;
    if (this.story.releasedAt) {
      this.story.releasedAt = null;
      this.notifyOfCanceledPublication();
    }
  }

  loadVersionTemplates() {
    this.story.getSeriesTemplates().subscribe(tdocs => {
      this.versionTemplates = {};
      this.versionTemplateOptions = tdocs.map(tdoc => {
        this.versionTemplates[tdoc.id] = tdoc;
        return [tdoc['label'], tdoc['id']];
      });
      this.story.loadRelated('versions').subscribe(() => this.setSelected());
    });
  }

  notifyOfCanceledPublication() {
    const futurePublished = this.story.publishedAt && new Date() < this.story.publishedAt;
    const removingReleaseDate = this.story.changed('releasedAt') && !this.story.releasedAt;
    if (removingReleaseDate && futurePublished) {
      this.modal.alert(
        '',
        'Removing the scheduled release date for a published episode will unpublish the episode.',
        () => {}
      );
    }
  }

  private setSelected() {
    let templateIds: any = this.versionTemplateOptions.map(opt => opt[1]);
    let selected = this.story.versions.filter(v => {
      return !v.isDestroy && v.template && templateIds.indexOf(v.template.id) > -1;
    }).map(v => v.template.id);
    if (selected.join(',') !== (this.versionTemplatesSelected || []).join(',')) {
      this.versionTemplatesSelected = selected;
    }
  }

}
