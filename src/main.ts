import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

if (!window.location.hostname.match(/localhost|\.dev|\.docker/)) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
