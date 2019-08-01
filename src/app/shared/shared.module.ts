import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TimeAgoPipe } from './date';
import { AdvancedSectionComponent, CopyInputDirective } from './form';
import { ImageFileComponent, ImageUploadComponent } from './image';
import { TextOverflowEllipsesComponent, TextOverflowFadeComponent, TextOverflowWebkitLineClampComponent } from './text-overflow';
import { FocusDirective, WysiwygComponent } from './wysiwyg';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  DatepickerModule, EpisodeListModule, FancyFormModule, HeroModule, IconModule, ImageModule, UploadModule,
  ModalModule, SelectModule, SpinnerModule, TagsModule, TzDatepickerModule, StickyModule, StatusBarModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [
    AdvancedSectionComponent,
    CopyInputDirective,
    FocusDirective,
    ImageFileComponent,
    ImageUploadComponent,
    TimeAgoPipe,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    WysiwygComponent
  ],
  exports: [
    AdvancedSectionComponent,
    CommonModule,
    EpisodeListModule,
    FormsModule,
    CopyInputDirective,
    DatepickerModule,
    TzDatepickerModule,
    FancyFormModule,
    UploadModule,
    FocusDirective,
    HeroModule,
    IconModule,
    ImageModule,
    ImageUploadComponent,
    TimeAgoPipe,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    SelectModule,
    SpinnerModule,
    StatusBarModule,
    StickyModule,
    TagsModule,
    WysiwygComponent
  ],
  imports: [
    CommonModule,
    EpisodeListModule,
    FormsModule,
    RouterModule,
    DatepickerModule,
    FancyFormModule,
    UploadModule,
    HeroModule,
    ImageModule,
    ModalModule,
    SelectModule,
    SpinnerModule,
    StatusBarModule,
    StickyModule,
    TagsModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})

export class SharedModule { }
