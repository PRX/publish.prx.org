import { NgModule } from '@angular/core';
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
import { AudioFileComponent, AudioUploadComponent, AudioVersionComponent,
  FileSelectDirective, ImageFileComponent, ImageUploadComponent } from './upload';

@NgModule({
  declarations: [
    AudioFileComponent,
    AudioUploadComponent,
    AudioVersionComponent,
    ButtonComponent,
    DurationPipe,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    HeroComponent,
    ImageFileComponent,
    ImageLoaderComponent,
    ImageUploadComponent,
    SpinnerComponent,
    TimeAgoPipe
  ],
  exports: [
    CommonModule,
    DragulaModule,
    FormsModule,
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
  ]
})

export class SharedModule { }
