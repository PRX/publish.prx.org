import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { TabModule } from 'ngx-prx-styleguide';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';
import { SeriesImportStatusCardModule } from '../series-import-status-card'

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabModule,
    seriesRouting,
    SeriesImportStatusCardModule
  ],
  providers: [
    ...seriesProviders
  ]
})

export class SeriesModule { }
