import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { TimeAgoPipe } from './date';
import { DurationPipe, FileSizePipe } from './file';
import { ButtonComponent, CapitalizePipe, FancyFieldComponent } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { HeroComponent } from './hero';
import { ImageLoaderComponent } from './image';
import { SpinnerComponent } from './spinner';
import { TabComponent } from './tab';
import { AudioButtonComponent, AudioFileComponent, AudioUploadComponent,
  AudioVersionComponent, FileSelectDirective, ImageFileComponent,
  ImageUploadComponent } from './upload';

@NgModule({
  declarations: [
    AudioButtonComponent,
    AudioFileComponent,
    AudioUploadComponent,
    AudioVersionComponent,
    ButtonComponent,
    CapitalizePipe,
    DurationPipe,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    HeroComponent,
    ImageFileComponent,
    ImageLoaderComponent,
    ImageUploadComponent,
    SpinnerComponent,
    TabComponent,
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
    TabComponent,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    DragulaModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})

export class SharedModule { }
