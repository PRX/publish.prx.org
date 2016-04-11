import {Component} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {SpinnerComponent} from '../shared/spinner/spinner.component';
import {CmsService} from '../shared/cms/cms.service';

@Component({
  directives: [SpinnerComponent, RouterLink],
  selector: 'publish-home',
  styleUrls: ['app/home/home.component.css'],
  template: `
    <div class="main">
      <section>
        <spinner *ngIf="!accounts"></spinner>
        <div *ngIf="accounts">
          <h1>Your Accounts</h1>
          <div *ngFor="#account of accounts; #i = index">
            <h2>{{account.name}} <i>{{account.type}}</i></h2>
            <ul>
              <li *ngFor="#story of accountStories[i]">
                <a [routerLink]="['Edit', {id: story.id}]">
                  <p *ngIf="story.title">{{story.title}}</p>
                  <p *ngIf="!story.title">Untitled #{{story.id}}</p>
                </a>
              </li>
            </ul>
            <story-list [account]="account"></story-list>
          </div>
        </div>
      </section>
    </div>
    `
})

export class HomeComponent {

  private accounts: any[];
  private accountStories: any[] = [];

  constructor(private cms: CmsService) {
    cms.follow('prx:authorization').followItems('prx:accounts').subscribe((docs) => {
      this.accounts = docs;
      for (let i = 0; i < docs.length; i++) {
        docs[i].followItems('prx:stories').subscribe((storyDocs) => {
          this.accountStories[i] = storyDocs;
          console.log(storyDocs);
        });
      }
    });
  }

}
