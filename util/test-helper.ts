import {setBaseTestProviders} from 'angular2/testing';
import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS}
  from 'angular2/platform/testing/browser';

// this can only be called ONCE - so don't add it to individual specs
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

// Mock router
import {provide, Type} from 'angular2/core';
import {Router, ROUTER_PRIMARY_COMPONENT, RouteRegistry} from 'angular2/router';
import {RootRouter} from 'angular2/src/router/router';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location/location';
import {AppComponent} from '../app/app.component';

// Mock cms
import {CmsService, MockCmsService} from '../app/shared/cms/cms.mocks';

// Component setup
import {injectAsync} from 'angular2/testing';
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
interface FixtureCallback { (cms: MockCmsService): void; }
export function setupComponent(componentType: Type, fixtureBuilder?: FixtureCallback) {
  this._prxComponent = componentType;
  this._prxFixtureBuilder = fixtureBuilder;
}

/**
 * Bootstrap a component (configured via setupComponent())
 */
interface BuildComponentCallback { (fixture: ComponentFixture): any; }
export function buildComponent(work: BuildComponentCallback): any {
  return injectAsync([TestComponentBuilder, CmsService],
                     (tcb: TestComponentBuilder, cms: MockCmsService) => {
    if (this._prxFixtureBuilder) {
      this._prxFixtureBuilder(cms);
    }
    if (!this._prxComponent) {
      console.error(`Test has no component defined! Did you forget to setupComponent()?`);
    }
    return tcb.createAsync(this._prxComponent).then((fix: ComponentFixture) => {
      return work(fix);
    });
  });
}
