import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { CmsService, HalDoc } from '../core';
import { ToastrService } from 'ngx-prx-styleguide';
import { IMPORT_SERIES_VALIDATIONS } from '../shared/model/series.model';
import { SeriesImportModel, SeriesModel, ImportValidationState } from '../shared';

import { SeriesComponent } from '../series/series.component';

@Component({
  providers: [],
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent {

  series: SeriesModel;

  constructor(
    public cms: CmsService,
    public toastr: ToastrService,
    private router: Router
  ){}

  ngOnInit(){
    this.cms.defaultAccount.subscribe(a => {
      this.series = new SeriesModel(a, null);
      this.series.setComponentValidationStrategy(this.validationStrategy());
    });
  }

  ngOnDestroy(){}

  save() {
    this.series.save().subscribe(() => {
      this.toastr.success(`Series created`);
      this.router.navigate(this.afterSaveNavigateParams());
    });
  }

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
