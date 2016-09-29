import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppErrorService } from './app-error.service';
import { routing, routingProviders, routingComponents } from './app.routing';

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
    BrowserModule,
    CoreModule,
    SeriesModule,
    SharedModule,
    StoryModule,
    SearchModule,
    routing
  ],
  providers: [
    {provide: ErrorHandler, useClass: AppErrorService},
    routingProviders
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
