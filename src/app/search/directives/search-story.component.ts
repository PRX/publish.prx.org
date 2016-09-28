import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'publish-search-story',
  styleUrls: ['search-story.component.css'],
  template: `
    <div class="form-group">
      <!-- TODO: delay search until finish typing -->
      <input (keyup)="searchByText()" [(ngModel)]="searchText" placeholder="search by title or description"/>
    </div>
    
    <div class="form-group">
      <p class="left">
        <label [attr.for]="searchSeries">Filter by Series</label>
        <select id="searchSeries" [(ngModel)]="searchSeriesId" (ngModelChange)="searchBySeries()">
          <option *ngFor="let seriesId of allSeriesIds" [value]="seriesId">{{allSeries[seriesId]?.title || 'No Series'}}</option>
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

export class SearchStoryComponent {
  @Input() searchSeriesId: number;
  @Input() allSeriesIds: number[];
  @Input() allSeries: any;
  @Output() searchStoriesByText = new EventEmitter<string>();
  @Output() searchStoriesBySeries = new EventEmitter<number>();

  searchText: string;
  searchOrderBy: string;

  orderByOptions: any[] = [
    {
      id: 'TITLE',
      name: 'Story Title'
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
    this.searchStoriesByText.emit(this.searchText);
  }

  searchBySeries() {
    this.searchStoriesBySeries.emit(this.searchSeriesId);
  }
}
