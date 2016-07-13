import {setBaseTestProviders} from '@angular/core/testing';
import {TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS, TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS}
  from '@angular/platform-browser-dynamic/testing';

// this can only be called ONCE - so don't add it to individual specs
setBaseTestProviders(
  TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
);

// Mock router
import {provide, Type, Component, Input} from '@angular/core';
// import {Router, ROUTER_PRIMARY_COMPONENT, ROUTER_PROVIDERS, RootRouter}
//   from '@angular/router';
import {Router, ROUTER_DIRECTIVES, ActivatedRoute, RouterOutletMap} from '@angular/router';
// import {ROUTER_FAKE_PROVIDERS} from '@angular/router/testing';
import {APP_BASE_HREF} from '@angular/common';
import {AppComponent} from '../app/app.component';
import {MockApplicationRef} from '@angular/core/testing';

// Mock cms
import {CmsService, MockCmsService} from '../app/shared/cms/cms.mocks';

// Component setup
import {inject, beforeEachProviders} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';

/**
 * Common tasks for building components and creating fixtures
 */
interface FixtureCallback {
  (cms: MockCmsService): void;
}
export function setupComponent(componentType: Type, fixtureBuilder?: FixtureCallback) {
  beforeEachProviders(() => [TestComponentBuilder]);
  beforeEach(() => {
    this._prxComponent = componentType;
    this._prxFixtureBuilder = fixtureBuilder;
  });
  afterEach(() => {
    delete this._prxComponent;
    delete this._prxFixtureBuilder;
  });
}

/**
 * Provide a mock router, for components lacking their own
 * TODO: https://github.com/angular/angular/issues/9496
 */
class MockRouter {
  createUrlTree(commands: any[]) { return commands[0]; }
  serializeUrl(url: any) { return url; }
}
class MockActivatedRoute { }
class MockRouterOutletMap { registerOutlet() { return; } }
export function mockRouter() {
  beforeEachProviders(() => [
    provide(Router, {useClass: MockRouter}),
    provide(ActivatedRoute, {useClass: MockActivatedRoute}),
    provide(RouterOutletMap, {useClass: MockRouterOutletMap})
  ]);

  // also need some fake router directives TODO: very hacky - help me angular2!
  @Component({selector: '[routerLinkActive]', template: '<ng-content></ng-content>'})
  class MockRouterLinkActive { @Input('routerLinkActiveOptions') routerLinkActiveOptions: {}; }
  let directive = ROUTER_DIRECTIVES.find(dir => !!dir.toString().match(/RouterLinkActive/));
  this.mockDirective(directive, MockRouterLinkActive);
}

/**
 * Mock CMS http requests
 */
export function mockCms() {
  beforeEachProviders(() => [
    provide(CmsService, {useClass: MockCmsService})
  ]);
}

/**
 * Mock out a service, equivalent to setting a beforeEachProviders
 */
export function mockService(service: Type, mockWith: {}) {
  beforeEachProviders(() => [
    provide(service, {useValue: mockWith})
  ]);
}

/**
 * Mock out a directive (sub-component).  Call with a @Component config.
 */
export function mockDirective(directive: Type, mockWith: {} | Type) {
  let mocker: Type;
  if (mockWith instanceof Type) {
    mocker = mockWith;
  } else {
    @Component(mockWith)
    class MockComponent {}
    mocker = MockComponent;
  }

  let key = directive.toString();
  beforeEach(() => {
    if (!this._prxOverrideDirective) {
      this._prxOverrideDirective = {};
    }
    this._prxOverrideDirective[key] = [directive, mocker];
  });
  afterEach(() => {
    delete this._prxOverrideDirective[key];
  });
}

/**
 * Bootstrap a component (configured via setupComponent())
 *
 * TODO: dynamically figure out the inject classes, instead of hardcoding
 *       them to [TestComponentBuilder, CmsService]
 */
interface BuildComponentCallback {
  (fix: ComponentFixture<any>, el: Element, comp: any): any;
}
export function buildComponent(work: BuildComponentCallback, withCms = false): any {
  let injects: any[] = [TestComponentBuilder];
  if (withCms) {
    injects.push(CmsService);
  }

  return inject(injects, (tcb: TestComponentBuilder, cms?: any) => {
    if (!this._prxComponent) {
      console.error(`Test has no component defined! Did you forget to setupComponent()?`);
    }
    if (this._prxFixtureBuilder) {
      this._prxFixtureBuilder(cms);
    }
    if (this._prxOverrideDirective) {
      for (let key of Object.keys(this._prxOverrideDirective)) {
        let vals = this._prxOverrideDirective[key];
        tcb = tcb.overrideDirective(this._prxComponent, vals[0], vals[1]);
      }
    }
    return tcb
      .createAsync(this._prxComponent)
      .then((fix: ComponentFixture<any>) => {
        return work(fix, fix.debugElement.nativeElement, fix.debugElement.componentInstance);
      });
  });
}
export function buildCmsComponent(work: BuildComponentCallback): any {
  return buildComponent.call(this, work, true);
}
