import {Component} from 'angular2/core';

@Component({
  selector: 'publish-header',
  styleUrls: ['app/header/header.css'],
  template: `
    <header>
      <prx-loading-bar></prx-loading-bar>
      <xi-context-menu class="context-menu">
        <ui-view name="context-menu"></ui-view>
      </xi-context-menu>
      <div class="contents">
        <prx-drawer-button></prx-drawer-button>
        <h1><a href="#">PRX</a></h1>
        <prx-nav-buttons></prx-nav-buttons>
      </div>
    </header>
  `
})

export class HeaderComponent { }
