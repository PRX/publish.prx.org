import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { HalModule } from 'ngx-prx-styleguide';

import { PlayerService } from './audio';
import { CastleService, CmsService, FeederService } from './hal';
import { FooterComponent } from './footer';
import { MimeTypeService, UploadService } from './upload';
import { ToastrComponent, ToastrService } from './toastr';
import { HeaderModule, ModalModule, ModalService } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [
    FooterComponent,
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
    HeaderModule,
    ModalModule,
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
