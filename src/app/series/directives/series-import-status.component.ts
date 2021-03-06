import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CmsService } from '../../core';
import { SeriesModel } from '../../shared';
import { TabService } from 'ngx-prx-styleguide';

@Component({
  templateUrl: 'series-import-status.component.html'
})

export class SeriesImportStatusComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService,
    private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
