import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'ngx-prx-styleguide';

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
