import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { TabModule } from 'ngx-prx-styleguide';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabModule,
    seriesRouting
  ],
  providers: [
    ...seriesProviders
  ]
})

export class SeriesModule { }
