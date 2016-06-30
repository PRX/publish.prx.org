import {it, describe, expect} from '@angular/core/testing';
import {ReplaySubject} from 'rxjs';
import {AuthGuard, UnauthGuard} from './auth.guard';

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

    it('auth disallows users', () => {
      let guard = new AuthGuard(<any> mockAuthService, <any> mockRouter);
      let canActivate: boolean;
      guard.canActivate().subscribe((can: boolean) => { canActivate = can; });
      expect(canActivate).toBeUndefined();
      mockAuthService.token.next(null);
      expect(canActivate).toEqual(false);
    });

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
