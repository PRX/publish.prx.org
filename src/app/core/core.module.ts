import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterModule, HalModule, HeaderModule, ModalModule, ModalService, ToastrModule, ToastrService } from 'ngx-prx-styleguide';

import { PlayerService } from 'ngx-prx-styleguide';
import { CmsService, FeederService } from './hal';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
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
    ModalService,
    PlayerService,
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
