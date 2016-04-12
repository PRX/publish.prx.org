import {provide} from 'angular2/core';
import {it, describe, expect, injectAsync, beforeEachProviders} from 'angular2/testing';
import {TestComponentBuilder, ComponentFixture, setBaseTestProviders} from 'angular2/testing';
import {
  TEST_BROWSER_PLATFORM_PROVIDERS,
  TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';
import { RootRouter } from 'angular2/src/router/router';
import { Location, RouteParams, Router, RouteRegistry, ROUTER_PRIMARY_COMPONENT } from 'angular2/router';
import { SpyLocation } from 'angular2/src/mock/location_mock';

import {CmsService, MockCmsService} from '../shared/cms/cms.mocks';
import {HomeComponent} from './home.component';

setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

describe('HomeComponent', () => {

  beforeEachProviders(() => [
    provide(CmsService, {useClass: MockCmsService}),
    RouteRegistry,
    provide(Location, {useClass: SpyLocation}),
    provide(ROUTER_PRIMARY_COMPONENT, {useValue: HomeComponent}),
    provide(Router, {useClass: RootRouter})
  ]);

  const buildComponent = (work: Function): any => {
    return injectAsync(
      [TestComponentBuilder, CmsService],
      (tcb: TestComponentBuilder, cms: MockCmsService) => {
        let auth = cms.mock('prx:authorization', {});
        auth.mock('prx:default-account', {
          name: 'foobar'
        });
        let accounts = auth.mockItems('prx:accounts', [{
          name: 'foobar'
        }]);
        for (let account of accounts) {
          account.mockItems('prx:stories', [{
            title: 'some story'
          }]);
        }
        return tcb.createAsync(HomeComponent).then((fix: ComponentFixture) => {
          work(fix);
        });
      }
    );
  };

  xit('renders logged in content', buildComponent((fix: ComponentFixture) => {
    const element = fix.nativeElement;
    fix.detectChanges();
    expect(element.querySelectorAll('p').length).toEqual(1);
    expect(element.querySelectorAll('p')[0].innerHTML).toMatch('You are logged in as foobar');
  }));

});
