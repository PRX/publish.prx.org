import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { searchRouting, searchProviders, searchComponents } from './search.routing';

@NgModule({
  declarations: [
    ...searchComponents
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    searchRouting
  ],
  providers: [
    ...searchProviders
  ]
})

export class SearchModule { }
