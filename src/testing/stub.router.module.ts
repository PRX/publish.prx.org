import { NgModule } from '@angular/core';
import { AppModule } from '../app/app.module';
import { StubRouterLinkDirective } from './stub.routerlink.directive';

/**
 * Needed so that `aot` build is working. But it isn't used throughout our tests and/or app.
 */
@NgModule({
  imports: [
    AppModule
  ],
  declarations: [
    StubRouterLinkDirective
  ]
})
export class FakeRouterModule {
}
