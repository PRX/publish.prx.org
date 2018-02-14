import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FooterModule, HalModule, HeaderModule, ModalModule, ModalService, ToastrModule, ToastrService } from 'ngx-prx-styleguide';

import { PlayerService } from './audio';
import { CmsService, FeederService } from './hal';
import { MimeTypeService, UploadService } from './upload';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule,
    HalModule
  ],
  exports: [
    FooterModule,
    HeaderModule,
    ModalModule,
    ToastrModule
  ],
  providers: [
    CmsService,
    FeederService,
    MimeTypeService,
    ModalService,
    PlayerService,
    UploadService,
    ToastrService
  ]
})

export class CoreModule {

  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }

}
