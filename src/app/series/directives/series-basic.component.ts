import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel, TabService } from '../../shared';
import { SeriesComponent } from '../series.component';

@Component({
  template: `
    <form *ngIf="series">
      <publish-fancy-field *ngIf="series.isNew && accountOptions?.length > 1" required 
        label="Owner" name="accountId" [select]="accountOptions" [model]="series" (onChange)="setAccount($event)">
        <div class="fancy-hint">Select the account under which to create this series.</div>
      </publish-fancy-field>
      
      <publish-fancy-field *ngIf="!series.isNew && accountOptions?.length > 1" label="Owner">
        <div class="fancy-hint">This series is owned by <strong>{{accountName}}</strong>.</div>
      </publish-fancy-field>
    
      <publish-fancy-field textinput required [model]="series" name="title" label="Series Title" required>
        <div class="fancy-hint">What's the name of your series?</div>
      </publish-fancy-field>

      <publish-fancy-field textinput required [model]="series" name="shortDescription" label="Teaser" required>
        <div class="fancy-hint">A short description of your series.</div>
      </publish-fancy-field>

      <h3><label for="description">Description</label></h3>
      <p class="hint">A full description of your series.</p>
      <publish-wysiwyg [model]="series" name="description" [content]="series.description"
        [images]="series.images" [changed]="descriptionChanged"></publish-wysiwyg>

      <publish-fancy-field label="Profile Image">
        <div class="fancy-hint">This image will be used as the cover image for your series.</div>
        <publish-image-upload [model]="series" purpose="profile" minWidth=1400 minHeight=1400></publish-image-upload>
      </publish-fancy-field>

      <publish-fancy-field label="Thumbnail Image">
        <div class="fancy-hint">Optionally provide an alternate image to use for smaller
          display purposes. If not provided, a rescaled thumbnail of your profile image
          will be used.</div>
        <publish-image-upload [model]="series" purpose="thumbnail" suggestSize="300 x 300"></publish-image-upload>
      </publish-fancy-field>
    </form>
  `,
  styleUrls: ['./series-basic.component.css']
})

export class SeriesBasicComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;
  accounts: HalDoc[];
  accountOptions: string[][];

  constructor(tab: TabService,
              private cms: CmsService,
              private parent: SeriesComponent) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
    });
    cms.accounts.subscribe((docs) => {
      this.accounts = docs;
      this.accountOptions = docs.map(doc => [doc['name'], doc.id]);
    });
  }

  setAccount(accountId: string) {
    let account = this.accounts.find((a) => a.id === +accountId);
    if (account) {
      this.series.set('accountId', account.id);
      this.parent.setSeries(account, null);
    }
  }

  get accountName(): string {
    let account = {};
    if (this.accounts && this.series.parent) {
      account = this.accounts.find((a) => a.id === this.series.parent.id);
    }
    return account['name'];
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  get descriptionChanged(): boolean {
    return this.series && this.series.changed('description', false);
  }
}
