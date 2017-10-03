import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { TabModule, SelectModule } from 'ngx-prx-styleguide';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SelectModule,
    SharedModule,
    TabModule,
    seriesRouting
  ],
  providers: [
    ...seriesProviders
  ]
})

export class SeriesModule { }
