import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { searchRouting, searchProviders, searchComponents } from './search.routing';

@NgModule({
  declarations: [
    ...searchComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    searchRouting
  ],
  providers: [
    ...searchProviders
  ]
})

export class SearchModule { }
