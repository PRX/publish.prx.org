import { Component, OnDestroy, DoCheck } from '@angular/core';
import { Subscription, concat, of } from 'rxjs';
import { StoryModel, SeriesModel, DistributionModel, FeederPodcastModel} from '../../shared';
import { HalDoc, ModalService, TabService } from 'ngx-prx-styleguide';
import { AudioVersionModel } from 'ngx-prx-styleguide';

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

      <prx-fancy-field textinput [model]="story" name="productionNotes" label="Production Notes">
        <div class="fancy-hint">Helpful information for the production and/or ad sales teams.<br/>
        Ex: 'Descriptions of violence in segment 2.'</div>
      </prx-fancy-field>

      <hr/>

      <prx-fancy-field required label="Audio Files">

        <prx-select
          *ngIf="versionTemplateOptions" class="file-select" placeholder="Select Template..."
          [selected]="versionTemplatesSelected" [options]="versionTemplateOptions"
          (select)="updateVersions($event)" [maxSelectedItems]="1" [closeOnSelect]="true"
          [class.invalid]="versionsInvalid" [class.changed]="versionsChanged">
        </prx-select>
        <prx-spinner *ngIf="!undeletedVersions"></prx-spinner>
        <prx-upload *ngFor="let v of undeletedVersions" [version]="v" [strict]="strict"></prx-upload>
        <div *ngIf="undeletedVersions?.length === 0" class="fancy-hint">
          Pick a version of your audio files to upload for this episode.
        </div>
        <div *ngIf="undeletedVersions?.length > 0" class="fancy-hint">
          Clear your selection to select another template.
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

      <prx-fancy-field label="Categories">
        <div class="fancy-hint">Enter categories relevant to the content of your episode. Type the category and press Enter to set it.</div>
        <prx-tags [selected]="story.tags" [options]="quickTags" (change)="onTagsChange($event)"></prx-tags>
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
    </form>
  `
})

export class BasicComponent implements OnDestroy, DoCheck {

  story: StoryModel;
  series: SeriesModel;
  distribution: DistributionModel;
  podcast: FeederPodcastModel;
  hasDrafts: boolean;
  tabSub: Subscription;
  versionTemplates: { [id: number]: HalDoc; };
  versionTemplatesSelected: number[];
  versionTemplateOptions: string[][];

  quickTags: object[] = [
    { name: 'adfree', value: 'adfree', tooltip: 'Informs some distributions to not include ads.'}
  ];

  constructor(
    tab: TabService,
    private modal: ModalService,
  ) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.story = s;
      this.series = new SeriesModel(null, s.parent);
      this.loadVersionTemplates();

      concat(
        this.loadDistribution(),
        this.loadPodcast(),
        this.loadUnpublished()
      ).subscribe({complete: () => {
          if (this.story.isNew && !this.podcast.complete && this.missingDrafts()) {
            this.alertForDrafts();
          }
        }});
    });
  }

  missingDrafts() {
    return (this.hasDrafts !== null && !this.hasDrafts);
  }

  alertForDrafts() {
    const msg = `The more drafts you add, the better we can support your podcast.
     Please add
     <a href="/series/${this.series.id}/plan">
       all of your known upcoming episodes
     </a>
     to the Production Calendar.`;

    this.modal.alert('Missing Episode Drafts', msg,  () => {  });
  }

  loadDistribution() {
    let obs = this.series.loadRelated('distributions');

    obs.subscribe(() => {
      this.distribution = this.series.distributions.find((d) => d.kind === 'podcast');
    });

    return obs;
  }

  loadPodcast() {
    if (!this.distribution) {
      this.podcast = null;
      return of({});
    }

    let obs = this.distribution.loadRelated('podcast');
    obs.subscribe(() => {
      this.podcast = this.distribution.podcast;
    });

    return obs;
  }

  loadUnpublished() {
    this.hasDrafts = null;

    const halParams = {
      page: 1,
      per: 1,
      filters: `after=${new Date().toISOString()}`,
      zoom: false
    };

    let obs = this.series.doc.followItems('prx:stories', halParams);

    obs.subscribe((stories: HalDoc[]) => {
      if (stories.length > 0) {
        this.hasDrafts = true;
      } else {
        this.hasDrafts = false;
      }
    });
    return obs;
  }

  unpublishedCountReady() {
    return this.hasDrafts !== null;
  }

  get podcastComplete() {
    if (!this.distribution) {
      return false;
    }
    return true;
  }

  ngDoCheck() {
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

  onTagsChange(tags: string[]) {
    this.story.tags = tags;
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
