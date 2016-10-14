import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { SearchSeries } from '../search-series.model';
import { CATEGORIES, SUBCATEGORIES } from '../../shared/model/story.categories';

@Component({
  selector: 'publish-search-series',
  styleUrls: ['search-series-form.component.css'],
  template: `
  <form>
    <div class="form-group">
      <input name="text" [(ngModel)]="model.text" (ngModelChange)="searchTextChange(model.text)"  
        placeholder="search by title or description"/>
    </div>
    
    <div class="form-group">
      <p class="left">
        <label [attr.for]="searchGenre">Filter by</label>
        <select id="searchGenre" name="genre" [(ngModel)]="model.genre" (ngModelChange)="modelChange.emit(model)">
          <option *ngFor="let genre of GENRES" [value]="genre">{{genre}}</option>
        </select>
        <select id="searchSubGenre" name="subGenre" [(ngModel)]="model.subGenre" (ngModelChange)="modelChange.emit(model)">
          <option *ngFor="let subgenre of SUBGENRES" [value]="subgenre">{{subgenre}}</option>
        </select>
        <!-- TODO: there should be a way to clear this, issue #52 -->
      </p>
    
      <p class="right">
        <label [attr.for]="orderBy">Order by</label>
        <select id="orderBy" name="orderBy" [(ngModel)]="model.orderBy" (ngModelChange)="modelChange.emit(model)">
          <option *ngFor="let orderBy of orderByOptions" [value]="orderBy.id">{{orderBy.name}}</option>
        </select>
    
        <input class="updown-toggle" name="orderDesc" type="checkbox" id="order" 
          [(ngModel)]="model.orderDesc" (ngModelChange)="modelChange.emit(model)"/>
        <label for="order"></label>
    
      </p>
    </div>
  </form>
`
})

export class SearchSeriesFormComponent implements OnInit {
  @Input() orderByOptions: any[];
  @Input() model: SearchSeries;
  @Output() modelChange = new EventEmitter<SearchSeries>();

  searchTextStream = new Subject<string>();

  searchTextChange(text: string) {
    this.searchTextStream.next(text);
  }

  ngOnInit() {
    this.searchTextStream
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe((text: string) => {
        this.modelChange.emit(this.model);
      });
  }

  get GENRES(): string[] {
    return CATEGORIES;
  }

  get SUBGENRES(): string[] {
    if (this.model.genre) {
      return SUBCATEGORIES[this.model.genre];
    } else {
      return [];
    }
  }
}
