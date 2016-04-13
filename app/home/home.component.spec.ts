import {it, describe, expect, beforeEachProviders} from 'angular2/testing';
import {provideRouter, provideCms, setupComponent, buildComponent} from '../../util/test-helper';

import {HomeComponent} from './home.component';

describe('HomeComponent', () => {

  beforeEachProviders(() => [
    provideRouter(),
    provideCms()
  ]);

  setupComponent(HomeComponent, (cms) => {
    let auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {
      name: 'foobar'
    });
    let accounts = auth.mockItems('prx:accounts', [{
      name: 'foobar'
    }]);
    for (let account of accounts) {
      account.mockItems('prx:stories', [{
        title: 'Some story title'
      }]);
    }
  });

  it('renders content', buildComponent((home) => {
    let element = home.nativeElement;
    home.detectChanges();
    expect(element.querySelectorAll('p').length).toEqual(1);
    expect(element.querySelectorAll('p')[0].innerHTML).toMatch('Some story title');
  }));

});
