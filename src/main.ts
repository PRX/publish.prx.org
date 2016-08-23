import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/';

if (!window.location.hostname.match(/localhost|\.dev|\.docker/)) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
