import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { AuthModule } from 'ngx-prx-styleguide';

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
    BrowserModule,
    CoreModule,
    AuthModule,
    SeriesModule,
    SharedModule,
    StoryModule,
    SearchModule,
    routing
  ],
  providers: [
    {provide: ErrorHandler, useClass: ErrorService},
    routingProviders
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
