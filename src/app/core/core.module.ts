import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HalModule } from 'ngx-prx-styleguide';

import { PlayerService } from './audio';
import { CastleService, CmsService, FeederService } from './cms';
import { FooterComponent } from './footer';
import { ModalComponent, ModalService } from './modal';
import { MimeTypeService, UploadService } from './upload';
import { ToastrComponent, ToastrService } from './toastr';

@NgModule({
  declarations: [
    FooterComponent,
    ModalComponent,
    ToastrComponent
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule,
    HalModule
  ],
  exports: [
    FooterComponent,
    ModalComponent,
    ToastrComponent
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
