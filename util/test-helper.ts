import {setBaseTestProviders} from 'angular2/testing';
import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS}
  from 'angular2/platform/testing/browser';

// this can only be called ONCE - so don't add it to individual specs
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

// Mock router
import {provide, Type, Component} from 'angular2/core';
import {Router, ROUTER_PRIMARY_COMPONENT, RouteRegistry} from 'angular2/router';
import {RootRouter} from 'angular2/src/router/router';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location/location';
import {AppComponent} from '../app/app.component';

// Mock cms
import {CmsService, MockCmsService} from '../app/shared/cms/cms.mocks';

// Component setup
import {injectAsync, beforeEachProviders} from 'angular2/testing';
import {TestComponentBuilder, ComponentFixture} from 'angular2/testing';

/**
 * Provide a mock router, for components lacking their own
 */
export function provideRouter(): any[] {
  return [
    RouteRegistry,
    provide(Location, {useClass: SpyLocation}),
    provide(ROUTER_PRIMARY_COMPONENT, {useValue: AppComponent}),
    provide(Router, {useClass: RootRouter})
  ];
}

/**
 * Mock CMS http requests
 */
export function provideCms(): any[] {
  return [provide(CmsService, {useClass: MockCmsService})];
}

/**
 * Common tasks for building components and creating fixtures
 */
interface FixtureCallback {
  (cms: MockCmsService): void;
}
export function setupComponent(componentType: Type, fixtureBuilder?: FixtureCallback) {
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
 * Mock out a service, equivalent to setting a beforeEachProviders
 */
export function mockService(service: Type, mockWith: {}) {
  console.log('mockingService', service);
  beforeEachProviders(() => [
    provide(service, {useValue: mockWith})
  ]);
}

/**
 * Mock out a directive (sub-component).  Call with a @Component config.
 */
export function mockDirective(directive: Type, mockWith: {}) {
  @Component(mockWith)
  class MockComponent {}

  let key = directive.toString();
  beforeEach(() => {
    if (!this._prxOverrideDirective) {
      this._prxOverrideDirective = {};
    }
    this._prxOverrideDirective[key] = [directive, MockComponent];
  });
  afterEach(() => {
    delete this._prxOverrideDirective[key];
  });
}

/**
 * Bootstrap a component (configured via setupComponent())
 *
 * TODO: dynamically figure out the injectAsync classes, instead of hardcoding
 *       them to [TestComponentBuilder, CmsService]
 */
interface BuildComponentCallback {
  (fix: ComponentFixture, el: Element, comp: any): any;
}
export function buildComponent(work: BuildComponentCallback, withCms = false): any {
  let injects: any[] = [TestComponentBuilder];
  if (withCms) {
    injects.push(CmsService);
  }

  return injectAsync(injects, (tcb: TestComponentBuilder, cms?: any) => {
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
      .then((fix: ComponentFixture) => {
        return work(fix, fix.debugElement.nativeElement, fix.debugElement.componentInstance);
      });
  });
}
export function buildCmsComponent(work: BuildComponentCallback): any {
  return buildComponent.call(this, work, true);
}
