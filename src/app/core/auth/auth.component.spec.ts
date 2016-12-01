import { cit, create, provide } from '../../../testing';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthUrls } from './auth.urls';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {

  create(AuthComponent);

  let token: string, refresh = new Subject<boolean>();
  provide(AuthService, {
    setToken: (t) => token = t,
    refresh: refresh
  });

  beforeEach(() => {
    token = null;
    spyOn(AuthUrls, 'buildUrl').and.returnValue('http://localhost:9876/assets/callback.html');
  });

  cit('renders the auth iframe', (fix, el, comp) => {
    expect(el).toQuery('iframe');
    expect(el).toQueryAttr('iframe', 'src', 'http://localhost:9876/assets/callback.html');
  });

  cit('does not parse tokens from blank iframe queries', (fix, el, comp) => {
    spyOn(AuthUrls, 'parseIframeQuery').and.returnValue(null);
    comp.checkAuth();
    expect(token).toBeNull();
  });

  cit('sets tokens from the iframe callback query', (fix, el, comp) => {
    spyOn(AuthUrls, 'parseIframeQuery').and.returnValue('the-query');
    spyOn(AuthUrls, 'parseToken').and.returnValue('the-token');
    comp.checkAuth();
    expect(token).toEqual('the-token');
  });

  cit('refreshes the auth token', (fix, el, comp) => {
    expect(AuthUrls.buildUrl).toHaveBeenCalledTimes(1);
    refresh.next(true);
    expect(AuthUrls.buildUrl).toHaveBeenCalledTimes(2);
  });

});
