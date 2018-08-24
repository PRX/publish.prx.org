import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CmsService } from '../../core';
import { HalDoc } from '../../core';
import { ModalService, TabService } from 'ngx-prx-styleguide';
import { SeriesImportModel, SeriesModel } from '../../shared';

@Component({
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent implements OnInit {

  id: number;
  base: string;
  tabSub: Subscription;
  series: SeriesModel;
  accounts: HalDoc[];
  accountOptions: string[][];

  seriesImport: SeriesImportModel;

  constructor(tab: TabService,
    private cms: CmsService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => {
      this.series = s;
      this.seriesImport = new SeriesImportModel(s.parent)
    });

    cms.accounts.subscribe((docs) => {
      this.accounts = docs;
      this.accountOptions = docs.map(doc => [doc['name'], doc.id]);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  save(){
    let wasNew = this.seriesImport.isNew;
    this.seriesImport.save().subscribe(() => {
      //this.toastr.success(`SeriesImport ${wasNew ? 'created' : 'saved'}`);
      if (wasNew) {
        this.router.navigate(['/']);
        // TODO
        //this.router.navigate(['/series-import', this.seriesImport.id]);
      }
    });
  }
}
