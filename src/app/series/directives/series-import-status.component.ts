import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel, SeriesImportModel } from '../../shared';
import { TabService } from 'ngx-prx-styleguide';
import { SeriesImportService } from '../series-import.service';

@Component({
  templateUrl: 'series-import-status.component.html'
})

export class SeriesImportStatusComponent implements OnDestroy {

  series: SeriesModel;
  seriesImports: Observable<SeriesImportModel[]>;
  tabSub: Subscription;

  ngOnInit(){}

  ngOnDestroy(){}

  constructor(tab: TabService,
    private cms: CmsService,
    private importer: SeriesImportService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.importer.refreshSeriesImports(s);
      this.seriesImports = this.importer.seriesImports;
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
