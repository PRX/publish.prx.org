import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroModule, ImageModule, SpinnerModule } from 'ngx-prx-styleguide';

import { SharedModule } from '../shared';
import { seriesRouting, seriesProviders, seriesComponents } from './series.routing';

@NgModule({
  declarations: [
    ...seriesComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    HeroModule,
    ImageModule,
    SpinnerModule,
    seriesRouting
  ],
  providers: [
    ...seriesProviders
  ]
})

export class SeriesModule { }
