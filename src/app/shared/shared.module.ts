import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { TimeAgoPipe } from './date';
import { DurationPipe, FileSizePipe } from './file';
import { ButtonComponent, FancyFieldComponent } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { HeroComponent } from './hero';
import { ImageLoaderComponent } from './image';
import { SpinnerComponent } from './spinner';
import { AudioUploadComponent, ImageUploadComponent } from './upload';

const COMPONENTS = [
  AudioUploadComponent,
  ButtonComponent,
  DurationPipe,
  FancyFieldComponent,
  FileSizePipe,
  HeroComponent,
  ImageLoaderComponent,
  ImageUploadComponent,
  SpinnerComponent,
  TimeAgoPipe
];

@NgModule({
  declarations: COMPONENTS,
  exports: [
    CommonModule,
    DragulaModule,
    FormsModule,
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    DragulaModule,
    FormsModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SharedModule { }
