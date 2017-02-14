import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel, TabService } from '../../shared';
import { SeriesComponent } from '../series.component';

@Component({
  templateUrl: 'series-basic.component.html'
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
