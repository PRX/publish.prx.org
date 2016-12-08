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
import { PromptComponent, WysiwygComponent } from './wysiwyg';

import { HoverDirective } from './hover';

@NgModule({
  declarations: [
    ButtonComponent,
    CapitalizePipe,
    DurationPipe,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    HeroComponent,
    HoverDirective,
    ImageFileComponent,
    ImageLoaderComponent,
    ImageUploadComponent,
    PromptComponent,
    SpinnerComponent,
    TabComponent,
    TimeAgoPipe,
    WysiwygComponent
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
    HoverDirective,
    ImageLoaderComponent,
    ImageUploadComponent,
    PromptComponent,
    SpinnerComponent,
    TabComponent,
    TimeAgoPipe,
    WysiwygComponent
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
