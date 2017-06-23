import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DatepickerComponent, TimeAgoPipe, TimepickerComponent } from './date';
import { DurationPipe, FileSelectDirective, FileSizePipe } from './file';
import { AdvancedConfirmDirective, AdvancedSectionComponent, ButtonComponent, CapitalizePipe,
         CopyInputDirective, FancyDurationComponent, FancyFieldComponent, PadZeroPipe } from './form';
import { AuthGuard, DeactivateGuard, UnauthGuard } from './guard';
import { HeroComponent } from './hero';
import { ImageFileComponent, ImageUploadComponent } from './image';
import { TabComponent } from './tab';
import { TextOverflowEllipsesComponent, TextOverflowFadeComponent, TextOverflowWebkitLineClampComponent } from './text-overflow';
import { FocusDirective, WysiwygComponent } from './wysiwyg';
import { ImageModule, SpinnerModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [
    AdvancedConfirmDirective,
    AdvancedSectionComponent,
    ButtonComponent,
    CapitalizePipe,
    CopyInputDirective,
    DatepickerComponent,
    DurationPipe,
    FancyDurationComponent,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroComponent,
    ImageFileComponent,
    ImageUploadComponent,
    PadZeroPipe,
    TabComponent,
    TimeAgoPipe,
    TimepickerComponent,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    WysiwygComponent
  ],
  exports: [
    AdvancedConfirmDirective,
    AdvancedSectionComponent,
    CommonModule,
    FormsModule,
    ButtonComponent,
    CapitalizePipe,
    CopyInputDirective,
    DatepickerComponent,
    DurationPipe,
    FancyDurationComponent,
    FancyFieldComponent,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroComponent,
    ImageUploadComponent,
    TabComponent,
    TimeAgoPipe,
    TimepickerComponent,
    TextOverflowEllipsesComponent,
    TextOverflowFadeComponent,
    TextOverflowWebkitLineClampComponent,
    WysiwygComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ImageModule,
    SpinnerModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})

export class SharedModule { }
