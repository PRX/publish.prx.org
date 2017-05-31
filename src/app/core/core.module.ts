import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { PlayerService } from './audio';
import { CastleService, CmsService } from './cms';
import { FooterComponent } from './footer';
import { HeaderComponent, NavItemComponent, NavUserComponent } from './header';
import { ModalComponent, ModalService } from './modal';
import { MimeTypeService, UploadService } from './upload';
import { ToastrComponent, ToastrService } from './toastr';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    NavItemComponent,
    NavUserComponent,
    ModalComponent,
    ToastrComponent
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    NavItemComponent,
    NavUserComponent,
    ModalComponent,
    ToastrComponent
  ],
  providers: [
    CastleService,
    CmsService,
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
