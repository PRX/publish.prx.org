import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    seriesRouting
  ],
  providers: [
    ...seriesProviders
  ]
})

export class SeriesModule { }
