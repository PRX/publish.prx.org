import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { AppComponent } from './app.component';
import { routing, routingProviders, routingComponents } from './app.routing';

import { AuthComponent, AuthGuard, AuthService, CmsService, DurationPipe,
  FileSizePipe, ImageLoaderComponent, MimeTypeService, ModalComponent, ModalService,
  SpinnerComponent, TimeAgoPipe, UploadService } from './shared';
import { HeaderComponent, NavItemComponent, NavUserComponent } from './header';
import { FooterComponent } from './footer';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DurationPipe,
    FileSizePipe,
    FooterComponent,
    HeaderComponent,
    ImageLoaderComponent,
    ModalComponent,
    NavItemComponent,
    NavUserComponent,
    SpinnerComponent,
    TimeAgoPipe,
    routingComponents
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    DragulaModule,
    routing
  ],
  providers: [
    AuthGuard,
    AuthService,
    CmsService,
    MimeTypeService,
    ModalService,
    UploadService,
    routingProviders
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
