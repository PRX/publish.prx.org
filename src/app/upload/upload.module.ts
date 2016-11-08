import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { SharedModule } from '../shared';

import { UploadComponent } from './upload.component';
import { FreeReorderDirective, FreeUploadComponent } from './free';
import { IllegalUploadComponent } from './illegal';
import { AudioInputComponent } from './shared';
import { TemplatedUploadComponent } from './templated';

@NgModule({
  declarations: [
    UploadComponent,
    FreeReorderDirective,
    FreeUploadComponent,
    IllegalUploadComponent,
    AudioInputComponent,
    TemplatedUploadComponent
  ],
  exports: [
    CommonModule,
    DragulaModule,
    SharedModule,
    UploadComponent
  ],
  imports: [
    CommonModule,
    DragulaModule,
    SharedModule
  ],
  providers: []
})

export class UploadModule { }
