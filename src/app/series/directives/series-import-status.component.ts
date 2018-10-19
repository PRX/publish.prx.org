import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel, SeriesImportModel } from '../../shared';
import { TabService } from 'ngx-prx-styleguide';

@Component({
  templateUrl: 'series-import-status.component.html'
})

export class SeriesImportStatusComponent implements OnDestroy {

  series: SeriesModel;
  seriesImports: SeriesImportModel[];
  tabSub: Subscription;

  ngOnInit(){}

  ngOnDestroy(){}

  constructor(tab: TabService,
    private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.loadImports();
    });
  }

  loadImports(): any {
    this.series.doc.follow('prx:podcast-imports').subscribe((doc) => {
      doc.followList('prx:items').subscribe((pidocs)=>{
        let models = pidocs.map((importDoc)=>{
          return new SeriesImportModel(this.series.doc, importDoc);
        });
        this.seriesImports = models;
      });
    });
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
