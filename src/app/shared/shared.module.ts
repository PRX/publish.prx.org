import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TimeAgoPipe } from './date';
import { DurationPipe, FileSelectDirective, FileSizePipe } from './file';
import { ButtonComponent, CapitalizePipe, CopyInputDirective, FancyFieldComponent } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { HeroComponent } from './hero';
import { ImageFileComponent, ImageLoaderComponent, ImageUploadComponent } from './image';
import { SpinnerComponent } from './spinner';
import { TabComponent } from './tab';
import { TextOverflowEllipsesComponent, TextOverflowFadeComponent, TextOverflowWebkitLineClampComponent } from './text-overflow';
import { FocusDirective, WysiwygComponent } from './wysiwyg';

import { HoverDirective } from './hover';

@NgModule({
  declarations: [
    ButtonComponent,
    CapitalizePipe,
    CopyInputDirective,
    DurationPipe,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroComponent,
    HoverDirective,
    ImageFileComponent,
    ImageLoaderComponent,
    ImageUploadComponent,
    SpinnerComponent,
    TabComponent,
    TimeAgoPipe,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    WysiwygComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CapitalizePipe,
    CopyInputDirective,
    DurationPipe,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroComponent,
    HoverDirective,
    ImageLoaderComponent,
    ImageUploadComponent,
    SpinnerComponent,
    TabComponent,
    TimeAgoPipe,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
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
