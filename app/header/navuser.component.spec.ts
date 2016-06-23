import {it, describe, expect} from '@angular/core/testing';
import {mockRouter, mockCms, setupComponent, buildCmsComponent} from '../../util/test-helper';
import {NavUserComponent} from './navuser.component';

describe('NavUserComponent', () => {

  mockRouter();

  mockCms();

  describe('with an account image', () => {

    setupComponent(NavUserComponent, (cms) => {
      let auth = cms.mock('prx:authorization', {});
      let account = auth.mock('prx:default-account', {name: 'TheAccountName'});
      account.mock('prx:image', {_links: {enclosure: {href: '/theimage'}}});
    });

    it('includes the user image', buildCmsComponent((fix, el, navuser) => {
      fix.detectChanges();
      expect(el.querySelector('spinner')).toBeNull();
      expect(el.querySelector('.name')).toHaveText('TheAccountName');
      expect(navuser.userName).toEqual('TheAccountName');
      expect(navuser.userImage).toEqual('http://cms.mock/v1/theimage');
    }));

  });

  describe('with no account image', () => {

    setupComponent(NavUserComponent, (cms) => {
      let auth = cms.mock('prx:authorization', {});
      let account = auth.mock('prx:default-account', {name: 'TheAccountName'});
      account.mockError('prx:image', 'Does not exist');
    });

    it('leaves the image blank', buildCmsComponent((fix, el, navuser) => {
      fix.detectChanges();
      expect(el.querySelector('.name')).toHaveText('TheAccountName');
      expect(navuser.userName).toEqual('TheAccountName');
      expect(navuser.userImage).toBeNull();
    }));

  });

  describe('while loading the account', () => {

    setupComponent(NavUserComponent, (cms) => {
      let auth = cms.mock('prx:authorization', {});
      let account = auth.mock('prx:default-account', {name: null});
      account.mockError('prx:image', 'Does not exist');
    });

    it('displays a waiting spinner', buildCmsComponent((fix, el, navuser) => {
      fix.detectChanges();
      expect(el.querySelector('spinner')).not.toBeNull();
    }));

  });

});
