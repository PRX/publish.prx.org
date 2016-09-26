import { setupComponent, buildComponent, mockCms } from '../../test-support';
import { NavUserComponent } from './navuser.component';
import { ImageLoaderComponent } from '../shared/image/image-loader.component';

describe('NavUserComponent', () => {

  setupComponent(NavUserComponent);

  let auth, account, image;
  beforeEach(() => {
    auth = mockCms.mock('prx:authorization', {});
    account = auth.mock('prx:default-account', {name: 'TheAccountName'});
    image = account.mock('prx:image', {_links: {enclosure: {href: '/theimage'}}});
  });

  describe('with an account image', () => {

    it('includes the user image', buildComponent((fix, el, navuser) => {
      expect(el.querySelector('spinner')).toBeNull();
      expect(el.querySelector('.name').textContent).toEqual('TheAccountName');
      expect(navuser.userName).toEqual('TheAccountName');
      expect(el.querySelector('image-loader > img').src).toEqual('http://cms.mock/v1/theimage');
    }));

  });

  describe('with error requesting account image', () => {

    beforeEach(() => account.mockError('prx:image', 'Does not exist'));

    it('includes the placeholder error image ', buildComponent((fix, el, navuser) => {
      expect(el.querySelector('.name').textContent).toEqual('TheAccountName');
      expect(navuser.userName).toEqual('TheAccountName');
      expect(el.querySelector('image-loader > img').src.indexOf(ImageLoaderComponent.PLACEHOLDER_ERROR)).not.toEqual(-1);
    }));

  });

  describe('while loading the account', () => {

    beforeEach(() => {
      account = auth.mock('prx:default-account', {name: null});
      account.mockError('prx:image', 'Does not exist');
    });

    it('displays a waiting spinner', buildComponent((fix, el, navuser) => {
      expect(el.querySelector('publish-spinner')).not.toBeNull();
    }));

  });

});
