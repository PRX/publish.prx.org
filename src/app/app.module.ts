import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { AuthGuard, AuthService, CmsService, DeactivateGuard, MimeTypeService,
  ModalService, UnauthGuard, UploadService } from './shared';

import { AppComponent } from './app.component';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { SeriesComponent } from './series';
import { StoryComponent, EditComponent, DecorateComponent, SellComponent } from './story';
import { routing } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SeriesComponent,
    StoryComponent,
    EditComponent,
    DecorateComponent,
    SellComponent
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
    DeactivateGuard,
    MimeTypeService,
    ModalService,
    UnauthGuard,
    UploadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
