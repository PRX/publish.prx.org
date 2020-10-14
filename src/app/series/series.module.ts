import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { TabModule, SelectModule } from 'ngx-prx-styleguide';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';
import { SeriesImportService } from './series-import.service';

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabModule,
    SelectModule,
    seriesRouting
  ],
  providers: [
    ...seriesProviders,
    SeriesImportService
  ]
})

export class SeriesModule { }
