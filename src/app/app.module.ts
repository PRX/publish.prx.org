import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';
import { AuthModule, AuthService, HeaderModule } from 'ngx-prx-styleguide';

import { AppComponent } from './app.component';
import { routing, routingProviders, routingComponents } from './app.routing';

import { ErrorService } from './error';
import { CoreModule } from './core';
import { SharedModule } from './shared';
import { SeriesModule } from './series';
import { StoryModule } from './story';
import { SearchModule } from './search';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents
  ],
  imports: [
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
    CommonModule,
    BrowserModule,
    CoreModule,
    AuthModule,
    HeaderModule,
    SeriesModule,
    SharedModule,
    StoryModule,
    SearchModule,
    routing
  ],
  providers: [
    {provide: ErrorHandler, useClass: ErrorService},
    routingProviders,
    AuthService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
