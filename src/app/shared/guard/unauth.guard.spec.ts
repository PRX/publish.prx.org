import { ReplaySubject } from 'rxjs';
import { UnauthGuard } from './unauth.guard';

const mockAuthService = {
  token: new ReplaySubject<string>(1)
};
const mockRouter = {
  goto: <any> null,
  navigate: (params: any[]) => { mockRouter.goto = params[0]; }
};

describe('UnauthGuard', () => {

  beforeEach(() => {
    mockAuthService.token = new ReplaySubject<string>(1);
    mockRouter.goto = null;
  });

  describe('with a token', () => {

    it('unauth disallows users', () => {
      let unguard = new UnauthGuard(<any> mockAuthService, <any> mockRouter);
      let canActivate: boolean;
      unguard.canActivate().subscribe((can: boolean) => { canActivate = can; });
      expect(canActivate).toBeUndefined();
      mockAuthService.token.next('something');
      expect(canActivate).toEqual(false);
    });

  });

  describe('without a token', () => {

    it('unauth allows users', () => {
      let unguard = new UnauthGuard(<any> mockAuthService, <any> mockRouter);
      let canActivate: boolean;
      unguard.canActivate().subscribe((can: boolean) => { canActivate = can; });
      expect(canActivate).toBeUndefined();
      mockAuthService.token.next(null);
      expect(canActivate).toEqual(true);
    });

  });

});
