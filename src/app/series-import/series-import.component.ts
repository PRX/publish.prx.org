import { Component, OnInit } from '@angular/core';

import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { IMPORT_SERIES_VALIDATIONS } from '../shared/model/series.model';
import { SeriesImportModel, ImportValidationState } from '../shared';

import { SeriesComponent } from '../series/series.component';

@Component({
  providers: [],
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent extends SeriesComponent implements OnInit {

  importValidationState: ImportValidationState = new ImportValidationState();

  validationStrategy(){
    return IMPORT_SERIES_VALIDATIONS;
  }

  afterSaveNavigateParams(){
    return ['/series', this.series.id, 'import-status'];
  }

  isValidatingAndSaving(){
    return this.importValidationState.validating() || this.series.isSaving;
  }

  validateImportUrl(success){
    this.importValidationState.setStartValidating();

    this.cms.auth.subscribe(a => {
      a.follow('prx:verify-rss', {url: this.series.importUrl}).subscribe((verified: any) => {
        this.importValidationState.setValid(verified);
        this.setSeriesValidationStrategy();
        success();
      }, (err) => {
        if (err.status == 400){
          this.toastr.error('The rss url is not valid.');
          return this.importValidationState.setInvalid();
        }
        throw err;
      });
    });
  };

  validateImportUrlAndSave(){
    this.validateImportUrl(() => this.save());
  };


}
