import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TimeAgoPipe } from './date';
import { DurationPipe, FileSelectDirective, FileSizePipe } from './file';
import { ButtonComponent, CapitalizePipe, FancyFieldComponent } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { HeroComponent } from './hero';
import { ImageFileComponent, ImageLoaderComponent, ImageUploadComponent } from './image';
import { SpinnerComponent } from './spinner';
import { TabComponent } from './tab';

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
