import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'ngx-prx-styleguide';

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
