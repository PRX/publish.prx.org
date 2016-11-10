import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { UploadModule } from '../upload';
import { storyRouting, storyProviders, storyComponents } from './story.routing';

@NgModule({
  declarations: [
    ...storyComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    UploadModule,
    storyRouting
  ],
  providers: [
    ...storyProviders
  ]
})

export class StoryModule { }
