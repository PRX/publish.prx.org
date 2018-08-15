import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { TabModule } from 'ngx-prx-styleguide';
import { seriesImportRouting, seriesImportProviders, seriesImportComponents } from './series-import.routing';

@NgModule({
  declarations: [
    ...seriesImportComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabModule,
    seriesImportRouting
  ],
  providers: [
    ...seriesImportProviders
  ]
})

export class SeriesImportModule { }
