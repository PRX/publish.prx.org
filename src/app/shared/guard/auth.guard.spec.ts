import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AuthGuard } from './auth.guard';

const mockAuthService = {
  token: new ReplaySubject<string>(1)
};
const mockRouter = {
  goto: <any> null,
  navigate: (params: any[]) => { mockRouter.goto = params[0]; }
};

describe('AuthGuard', () => {

  beforeEach(() => {
    mockAuthService.token = new ReplaySubject<string>(1);
    mockRouter.goto = null;
  });

  describe('with a token', () => {

    it('auth allows users', () => {
      let guard = new AuthGuard(<any> mockAuthService, <any> mockRouter);
      let canActivate: boolean;
      guard.canActivate().subscribe((can: boolean) => { canActivate = can; });
      expect(canActivate).toBeUndefined();
      mockAuthService.token.next('something');
      expect(canActivate).toEqual(true);
    });

  });

  describe('without a token', () => {

    it('auth disallows users', () => {
      let guard = new AuthGuard(<any> mockAuthService, <any> mockRouter);
      let canActivate: boolean;
      guard.canActivate().subscribe((can: boolean) => { canActivate = can; });
      expect(canActivate).toBeUndefined();
      mockAuthService.token.next(null);
      expect(canActivate).toEqual(false);
    });

  });

});
