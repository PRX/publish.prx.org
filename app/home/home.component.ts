import {Component} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {CmsService} from '../shared/cms/cms.service';

@Component({
  directives: [SpinnerComponent, RouterLink],
  selector: 'publish-home',
  styleUrls: ['app/home/home.component.css'],
  template: `
    <spinner *ngIf="isLoading"></spinner>
    <div *ngIf="!isLoading">
      <h1>Home Page</h1>
      <p *ngIf="userName">You are logged in as {{userName}}</p>
      <p *ngIf="!userName">You are not logged in. Shame on you.</p>
      <a [routerLink]="['Edit', {id: 175235}]">Edit some story</a>
    </div>
    `
})

export class HomeComponent {

  private isLoading: boolean = true;
  private userName: string;

  constructor(private cmsService: CmsService) {
    this.cmsService.follows('prx:authorization', 'prx:default-account').subscribe((doc) => {
      this.userName = doc['name'];
      this.isLoading = false;
    });
  }

}
