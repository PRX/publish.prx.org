import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel, SeriesImportModel } from '../../shared';
import { TabService } from 'ngx-prx-styleguide';
import { map } from 'rxjs/operators';

@Component({
  templateUrl: 'series-import-status.component.html'
})

export class SeriesImportStatusComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  ngOnInit(){}

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
