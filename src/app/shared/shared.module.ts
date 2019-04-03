import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TimeAgoPipe } from './date';
import { DurationPipe, FileSelectDirective, FileSizePipe } from './file';
import { AdvancedSectionComponent, CopyInputDirective } from './form';
import { ImageFileComponent, ImageUploadComponent } from './image';
import { TextOverflowEllipsesComponent, TextOverflowFadeComponent, TextOverflowWebkitLineClampComponent } from './text-overflow';
import { FocusDirective, WysiwygComponent } from './wysiwyg';
import { AuthGuard, DeactivateGuard, UnauthGuard, TzDatepickerModule,
  DatepickerModule, FancyFormModule, HeroModule, ImageModule,
  ModalModule, SpinnerModule } from 'ngx-prx-styleguide';
import { StickyDirective } from './sticky/sticky.directive';

@NgModule({
  declarations: [
    AdvancedSectionComponent,
    CopyInputDirective,
    DurationPipe,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    ImageFileComponent,
    ImageUploadComponent,
    TimeAgoPipe,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    WysiwygComponent,
    StickyDirective
  ],
  exports: [
    AdvancedSectionComponent,
    CommonModule,
    FormsModule,
    CopyInputDirective,
    DatepickerModule,
    TzDatepickerModule,
    DurationPipe,
    FancyFormModule,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroModule,
    ImageModule,
    ImageUploadComponent,
    TimeAgoPipe,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    SpinnerModule,
    WysiwygComponent,
    StickyDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DatepickerModule,
    FancyFormModule,
    HeroModule,
    ImageModule,
    ModalModule,
    SpinnerModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})

export class SharedModule { }
