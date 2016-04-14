import {it, describe, expect, beforeEachProviders} from 'angular2/testing';
import {provideRouter, provideCms, setupComponent, buildCmsComponent} from '../../util/test-helper';
import {HomeComponent} from './home.component';

describe('HomeComponent', () => {

  beforeEachProviders(() => [
    provideRouter(),
    provideCms()
  ]);

  setupComponent(HomeComponent, (cms) => {
    let auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {
      name: 'TheAccountName'
    });
    let accounts = auth.mockItems('prx:accounts', [{
      name: 'TheAccountName'
    }]);
    for (let account of accounts) {
      account.mockItems('prx:stories', [{
        title: 'Some story title'
      }]);
    }
  });

  it('shows the user accounts', buildCmsComponent((fix, el, home) => {
    expect(el.textContent).toMatch('TheAccountName');
    expect(el.textContent).toMatch('Some story title');
  }));

  it('shows a loading spinner', buildCmsComponent((fix, el, home) => {
    expect(el.querySelector('spinner')).toBeNull();
    home.accounts = null;
    fix.detectChanges();
    expect(el.querySelector('spinner')).not.toBeNull();
  }));

});
