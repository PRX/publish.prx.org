import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AuthComponent, AuthService } from './auth';
import { CmsService } from './cms';
import { FooterComponent } from './footer';
import { HeaderComponent, NavItemComponent, NavUserComponent } from './header';
import { ModalComponent, ModalService } from './modal';
import { MimeTypeService, UploadService } from './upload';

@NgModule({
  declarations: [
    AuthComponent,
    FooterComponent,
    HeaderComponent,
    NavItemComponent,
    NavUserComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    HttpModule,
    RouterModule
  ],
  exports: [
    AuthComponent,
    FooterComponent,
    HeaderComponent,
    NavItemComponent,
    NavUserComponent,
    ModalComponent
  ],
  providers: [
    AuthService,
    CmsService,
    MimeTypeService,
    ModalService,
    UploadService
  ]
})

export class CoreModule {

  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }

}
