import {Injectable} from '@angular/core';
import {CanActivate, CanDeactivate, Router} from '@angular/router';
import {Observable} from 'rxjs';

import {AuthService} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.token.map((token) => {
      if (token) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    }).first();
  }

}

@Injectable()
export class UnauthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.token.map((token) => {
      if (token) {
        this.router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    }).first();
  }

}

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}
@Injectable()
export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | boolean {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
