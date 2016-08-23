import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AuthGuard, AuthService, CmsService, DeactivateGuard, MimeTypeService,
  ModalService, UnauthGuard, UploadService } from './shared';

import { AppComponent } from './app.component';
import { HomeComponent } from './home';
import { routing } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
    AuthGuard,
    AuthService,
    CmsService,
    DeactivateGuard,
    MimeTypeService,
    ModalService,
    UnauthGuard,
    UploadService
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
