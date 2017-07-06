import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DatepickerComponent, TimeAgoPipe, TimepickerComponent } from './date';
import { DurationPipe, FileSelectDirective, FileSizePipe } from './file';
import { AdvancedSectionComponent, CopyInputDirective } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { ImageFileComponent, ImageUploadComponent } from './image';
import { TabComponent } from './tab';
import { TextOverflowEllipsesComponent, TextOverflowFadeComponent, TextOverflowWebkitLineClampComponent } from './text-overflow';
import { FocusDirective, WysiwygComponent } from './wysiwyg';
import { DatepickerModule, FancyFormModule, HeroModule, ImageModule, ModalModule, SpinnerModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [
    AdvancedSectionComponent,
    CopyInputDirective,
    DatepickerComponent,
    DurationPipe,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    ImageFileComponent,
    ImageUploadComponent,
    TabComponent,
    TimeAgoPipe,
    TimepickerComponent,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    WysiwygComponent
  ],
  exports: [
    AdvancedSectionComponent,
    CommonModule,
    FormsModule,
    CopyInputDirective,
    DatepickerComponent,
    DatepickerModule,
    DurationPipe,
    FancyFormModule,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroModule,
    ImageModule,
    ImageUploadComponent,
    TabComponent,
    TimeAgoPipe,
    TimepickerComponent,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    SpinnerModule,
    WysiwygComponent
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
