import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { SeriesImportStatusCardComponent } from './series-import-status-card.component'

@NgModule({
  declarations: [
    SeriesImportStatusCardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    SeriesImportStatusCardComponent
  ],
  providers: [
  ]
})
export class SeriesImportStatusCardModule { }
