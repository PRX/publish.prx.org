import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CATEGORIES, SUBCATEGORIES } from '../../shared/model/story.categories';

@Component({
  selector: 'publish-search-series',
  styleUrls: ['search-series.component.css'],
  template: `
    <div class="form-group">
      <!-- TODO: delay search until finish typing -->
      <input (keyup)="searchByText()" [(ngModel)]="searchText" placeholder="search by title or description"/>
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
        <!-- TODO: there should be a way to clear this -->
      </p>
    
      <p class="right">
        <label [attr.for]="orderBy">Order by</label>
        <select id="orderBy" [(ngModel)]="searchOrderBy">
          <option *ngFor="let orderBy of orderByOptions" [value]="orderBy.id">{{orderBy.name}}</option>
        </select>
    
        <input class="updown-toggle" type="checkbox" id="order"/>
        <label for="order"></label>
    
      </p>
    </div>
`
})

export class SearchSeriesComponent {
  @Output() searchSeriesByText = new EventEmitter<string>();
  @Output() searchSeriesByGenre = new EventEmitter<any>();

  searchText: string;
  searchGenre: string;
  searchSubGenre: string;
  searchOrderBy: string;

  orderByOptions: any[] = [
    {
      id: 'TITLE',
      name: 'Series Title'
    },
    {
      id: 'UPDATED',
      name: 'Last Updated'
    },
    {
      id: 'PUBLISHED',
      name: 'When Published'
    }
  ];

  searchByText() {
    this.searchSeriesByText.emit(this.searchText);
  }

  searchByGenre() {
    this.searchSeriesByGenre.emit({genre: this.searchGenre, subgenre: this.searchSubGenre});
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
