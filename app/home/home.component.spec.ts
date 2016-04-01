import {provide} from 'angular2/core';
import {it, describe, expect, injectAsync, beforeEachProviders} from 'angular2/testing';
import {TestComponentBuilder, ComponentFixture, setBaseTestProviders} from 'angular2/testing';
import {
  TEST_BROWSER_PLATFORM_PROVIDERS,
  TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';

import {CmsService, MockCmsService} from '../shared/cms/cms.mocks';
import {HomeComponent} from './home.component';

setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

describe('HomeComponent', () => {

  beforeEachProviders(() => [
    provide(CmsService, {useClass: MockCmsService})
  ]);

  const buildComponent = (work: Function): any => {
    return injectAsync(
      [TestComponentBuilder, CmsService],
      (tcb: TestComponentBuilder, cms: MockCmsService) => {
        cms.mock(['prx:authorization', 'prx:default-account'], {
          name: 'foobar'
        });
        return tcb.createAsync(HomeComponent).then((fix: ComponentFixture) => {
          work(fix);
        });
      }
    );
  };

  it('renders logged in content', buildComponent((fix: ComponentFixture) => {
    const element = fix.nativeElement;
    fix.detectChanges();
    expect(element.querySelectorAll('p').length).toEqual(1);
    expect(element.querySelectorAll('p')[0].innerHTML).toMatch('You are logged in as foobar');
  }));

});
