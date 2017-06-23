import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModule, SpinnerModule } from 'ngx-prx-styleguide';

import { SharedModule } from '../shared';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    ImageModule,
    SpinnerModule,
    seriesRouting
  ],
  providers: [
    ...seriesProviders
  ]
})

export class SeriesModule { }
