import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'publish-search-story',
  styleUrls: ['search-story.component.css'],
  template: `
    <div class="form-group">
      <!-- TODO: delay search until finish typing, issue #54 -->
      <input (ngModelChange)="searchByText()" [(ngModel)]="searchText" placeholder="search by title or description"/>
    </div>
    
    <div class="form-group">
      <p class="left">
        <label [attr.for]="searchSeries">Filter by Series</label>
        <select id="searchSeries" [(ngModel)]="searchSeriesId" (ngModelChange)="searchBySeries()">
          <option *ngFor="let seriesId of allSeriesIds" [value]="seriesId">{{allSeries[seriesId]?.title || 'No Series'}}</option>
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

export class SearchStoryComponent {
  @Input() searchOrderBy: string;
  @Input() searchOrderDesc: boolean;
  @Input() orderByOptions: any[];
  @Input() searchSeriesId: number;
  @Input() allSeriesIds: number[];
  @Input() allSeries: any;
  @Output() searchStoriesByText = new EventEmitter<string>();
  @Output() searchStoriesBySeries = new EventEmitter<number>();
  @Output() searchStoriesByOrder = new EventEmitter<any>();

  searchText: string;

  searchByText() {
    this.searchStoriesByText.emit(this.searchText);
  }

  searchBySeries() {
    this.searchStoriesBySeries.emit(this.searchSeriesId);
  }

  searchByOrder() {
    this.searchStoriesByOrder.emit({orderBy: this.searchOrderBy, desc: this.searchOrderDesc});
  }
}
