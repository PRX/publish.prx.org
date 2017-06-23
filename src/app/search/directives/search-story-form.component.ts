import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { SearchStory } from '../search-story.model';

@Component({
  selector: 'publish-search-story-form',
  styleUrls: ['search-form.component.css'],
  template: `
    <form>
      <div class="form-group">
        <input name="text" [(ngModel)]="model.text" (ngModelChange)="searchTextChange(model.text)"
          placeholder="search by title or description"/>
      </div>

      <div class="form-group">
        <p class="left">
          <label for="searchSeries">Filter by Series</label>
          <select id="searchSeries" name="series"
            [(ngModel)]="model.seriesId" (ngModelChange)="modelChange.emit(model)">
            <option selected disabled value="undefined">Select Series</option>
            <option *ngFor="let seriesId of allSeriesIds" [value]="seriesId">{{allSeries[seriesId]?.title || 'No Series'}}</option>
          </select>
          <button class="btn-link" (click)="clearSeries()"><i class="icon-cancel"></i></button>
        </p>

        <p class="right">
          <label for="orderBy">Order by</label>
          <select id="orderBy" name="orderBy" [(ngModel)]="model.orderBy" (ngModelChange)="modelChange.emit(model)">
            <option *ngFor="let orderBy of orderByOptions" [value]="orderBy.id">{{orderBy.name}}</option>
          </select>

          <input class="updown-toggle" name="orderDesc" type="checkbox" id="orderDesc" name="orderDesc"
            [(ngModel)]="model.orderDesc" (ngModelChange)="modelChange.emit(model)"/>
          <label for="orderDesc"></label>

        </p>
      </div>
    </form>
`
})

export class SearchStoryFormComponent implements OnInit {
  @Input() allSeriesIds: number[];
  @Input() allSeries: any;
  @Input() orderByOptions: any[];

  @Input() model: SearchStory;
  @Output() modelChange = new EventEmitter<SearchStory>();

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

  clearSeries() {
    this.model.seriesId = undefined;
    this.modelChange.emit(this.model);
  }
}
