import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { SearchSeries } from '../search-series.model';

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
      <p class="right">
        <label for="orderBy">Order by</label>
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
}
