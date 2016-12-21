import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { SharedModule } from '../shared';

import { UploadComponent } from './upload.component';
import { FreeReorderDirective, FreeUploadComponent } from './free';
import { IllegalUploadComponent } from './illegal';
import { AudioCancelDirective, AudioClassesDirective, AudioDurationComponent,
         AudioInputComponent, AudioPlayerComponent, AudioStateComponent,
         ClickDirective } from './shared';
import { TemplatedUploadComponent } from './templated';

@NgModule({
  declarations: [
    AudioCancelDirective,
    AudioClassesDirective,
    AudioDurationComponent,
    AudioInputComponent,
    AudioPlayerComponent,
    AudioStateComponent,
    ClickDirective,
    FreeReorderDirective,
    FreeUploadComponent,
    IllegalUploadComponent,
    TemplatedUploadComponent,
    UploadComponent
  ],
  exports: [
    ClickDirective,
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
