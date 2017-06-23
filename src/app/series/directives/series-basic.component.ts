import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel, TabService } from '../../shared';

@Component({
  templateUrl: 'series-basic.component.html'
})

export class SeriesBasicComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;
  accounts: HalDoc[];
  accountOptions: string[][];

  constructor(tab: TabService,
              private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
    });
    cms.accounts.subscribe((docs) => {
      this.accounts = docs;
      this.accountOptions = docs.map(doc => [doc['name'], doc.id]);
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  get descriptionChanged(): boolean {
    return this.series && this.series.changed('description', false);
  }

  newOwnerConfirm(newId: number): string {
    let prompt, newName;
    if (newId && this.accounts.find((a) => a.id === +newId)) {
      newName = this.accounts.find((a) => a.id === +newId)['name'];
    }
    if (!this.series.isNew && this.series.hasStories) {
      prompt = `Are you sure you want to change the owner of this series
       from ${this.series.parent['name']}`;
       if (newName) {
         prompt += ` to ${newName}`;
       }
       prompt += `? This will change the account for all stories in the series,
       and will affect who can access the series.`;
    }
    return prompt;
  }
}
