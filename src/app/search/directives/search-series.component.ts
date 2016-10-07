import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CATEGORIES, SUBCATEGORIES } from '../../shared/model/story.categories';

@Component({
  selector: 'publish-search-series',
  styleUrls: ['search-series.component.css'],
  template: `
    <div class="form-group">
      <!-- TODO: delay search until finish typing, issue #54 -->
      <input (ngModelChange)="searchByText()" [(ngModel)]="searchText" placeholder="search by title or description"/>
    </div>
    
    <div class="form-group">
      <p class="left">
        <label [attr.for]="searchGenre">Filter by</label>
        <select id="searchGenre" [(ngModel)]="searchGenre" (ngModelChange)="searchByGenre()">
          <option *ngFor="let genre of GENRES" [value]="genre">{{genre}}</option>
        </select>
        <select id="searchSubGenre" [(ngModel)]="searchSubGenre" (ngModelChange)="searchByGenre()">
          <option *ngFor="let subgenre of SUBGENRES" [value]="subgenre">{{subgenre}}</option>
        </select>
        <!-- TODO: there should be a way to clear this, issue #52 -->
      </p>
    
      <p class="right">
        <label [attr.for]="orderBy">Order by</label>
        <select id="orderBy" [(ngModel)]="searchOrderBy" (ngModelChange)="searchByOrder()">
          <option *ngFor="let orderBy of orderByOptions" [value]="orderBy.id">{{orderBy.name}}</option>
        </select>
    
        <input class="updown-toggle" type="checkbox" id="order" [(ngModel)]="searchOrderDesc" (ngModelChange)="searchByOrder()"/>
        <label for="order"></label>
    
      </p>
    </div>
`
})

export class SearchSeriesComponent {
  @Input() searchOrderBy: string;
  @Input() searchOrderDesc: boolean;
  @Input() orderByOptions: any[];
  @Output() searchSeriesByText = new EventEmitter<string>();
  @Output() searchSeriesByGenre = new EventEmitter<any>();
  @Output() searchSeriesByOrder = new EventEmitter<any>();

  searchText: string;
  searchGenre: string;
  searchSubGenre: string;

  searchByText() {
    this.searchSeriesByText.emit(this.searchText);
  }

  searchByGenre() {
    this.searchSeriesByGenre.emit({genre: this.searchGenre, subgenre: this.searchSubGenre});
  }

  searchByOrder() {
    this.searchSeriesByOrder.emit({orderBy: this.searchOrderBy, desc: this.searchOrderDesc});
  }

  get GENRES(): string[] {
    return CATEGORIES;
  }

  get SUBGENRES(): string[] {
    if (this.searchGenre) {
      return SUBCATEGORIES[this.searchGenre];
    } else {
      return [];
    }
  }
}
