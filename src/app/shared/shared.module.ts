import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TimeAgoPipe } from './date';
import { DurationPipe, FileSizePipe } from './file';
import { ButtonComponent, CapitalizePipe, FancyFieldComponent } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { HeroComponent } from './hero';
import { ImageLoaderComponent } from './image';
import { SpinnerComponent } from './spinner';
import { TabComponent } from './tab';
import { FileSelectDirective, ImageFileComponent, ImageUploadComponent } from './upload';

@NgModule({
  declarations: [
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
    FormsModule,
    ButtonComponent,
    CapitalizePipe,
    DurationPipe,
    FancyFieldComponent,
    FileSelectDirective,
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
