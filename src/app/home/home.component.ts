import {Component} from 'angular2/core';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {AuthService, PrxAuthUser} from '../auth/auth.service';

@Component({
  directives: [SpinnerComponent],
  selector: 'publish-home',
  styleUrls: ['app/home/home.component.css'],
  template: `
    <spinner [spinning]="isLoading"></spinner>
    <div *ngIf="!isLoading">
      <h1>Home Page</h1>
      <template [ngIf]="authUser">
        <p>You are logged in as {{authUser.name}}</p>
      </template>
      <template [ngIf]="!authUser">
        <p>You are not logged in</p>
      </template>
    </div>
    `
})

export class HomeComponent {

  private isLoading: boolean = true;
  private authUser: PrxAuthUser;

  constructor(private authService: AuthService) {
    this.authService.user.subscribe(this.authChanged);
  }

  authChanged = (user:PrxAuthUser) => {
    this.isLoading = false;
    this.authUser = user;
  }

}
