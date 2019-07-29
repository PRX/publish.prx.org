import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { TabModule, UploadModule } from 'ngx-prx-styleguide';
import { storyRouting, storyProviders, storyComponents } from './story.routing';

@NgModule({
  declarations: [
    ...storyComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabModule, // needs own TabModule for separate instance of TabService
    UploadModule,
    storyRouting
  ],
  providers: [
    ...storyProviders
  ]
})

export class StoryModule { }
