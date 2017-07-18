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
import { AuthGuard, DeactivateGuard, UnauthGuard,
  DatepickerModule, FancyFormModule, HeroModule, ImageModule,
  ModalModule, SpinnerModule, TabModule, TabService } from 'ngx-prx-styleguide';

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
    WysiwygComponent
  ],
  exports: [
    AdvancedSectionComponent,
    CommonModule,
    FormsModule,
    CopyInputDirective,
    DatepickerModule,
    DurationPipe,
    FancyFormModule,
    FileSelectDirective,
    FileSizePipe,
    FocusDirective,
    HeroModule,
    ImageModule,
    ImageUploadComponent,
    TabModule,
    TimeAgoPipe,
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
    SpinnerModule,
    TabModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard,
    TabService
  ]
})

export class SharedModule { }
