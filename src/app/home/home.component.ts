import {Component} from 'angular2/core';
import {SpinnerComponent} from './../shared/spinner/spinner.component';

@Component({
  directives: [SpinnerComponent],
  selector: 'publish-home',
  styleUrls: ['app/home/home.component.css'],
  template: `
    <spinner [spinning]="isLoading"></spinner>
    <div *ngIf="!isLoading">
      <h1>Home Page</h1>
      <p>You are viewing the home page</p>
    </div>
    `
})

export class HomeComponent {

  private isLoading: boolean = true;

  constructor() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

}
