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
  // An observable on an array of observables on series import instances
  // Load the series imports, then create a observable stream for each one
  // polling until we navigate away or the import finishes
  tabSub: Subscription;

  ngOnInit(){}

  constructor(tab: TabService,
    private cms: CmsService,
    private importLoader: SeriesImportService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
