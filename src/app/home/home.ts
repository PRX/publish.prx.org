import {Component} from 'angular2/core';
import {Spinner} from './../shared/spinner/spinner';

@Component({
  directives: [Spinner],
  selector: 'publish-home',
  styleUrls: ['app/home/home.css'],
  template: `
    <spinner [spinning]="isLoading"></spinner>
    <div *ngIf="!isLoading">
      <h1>Home Page</h1>
      <p>You are viewing the home page</p>
    </div>
    `
})

export class Home {

  private isLoading: boolean = true;

  constructor() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

}
