import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FooterModule, HalModule, ToastrModule, ToastrService } from 'ngx-prx-styleguide';

import { PlayerService } from './audio';
import { CastleService, CmsService, FeederService } from './hal';
import { ModalComponent, ModalService } from './modal';
import { MimeTypeService, UploadService } from './upload';

@NgModule({
  declarations: [
    ModalComponent
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule,
    HalModule
  ],
  exports: [
    FooterModule,
    ModalComponent,
    ToastrModule,
  ],
  providers: [
    CastleService,
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
