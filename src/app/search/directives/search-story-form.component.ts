import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchStory } from '../search-story.model';

@Component({
  selector: 'publish-search-story-form',
  styleUrls: ['search-story-form.component.css'],
  template: `
    <form #searchStoryForm="ngForm">
      <div class="form-group">
        <!-- TODO: delay search until finish typing, issue #54 -->
        <input name="text" [(ngModel)]="model.text" (ngModelChange)="modelChange.emit(model)" 
          placeholder="search by title or description"/>
      </div>
      
      <div class="form-group">
        <p class="left">
          <label [attr.for]="searchSeries">Filter by Series</label>
          <select id="searchSeries" name="series" 
            [(ngModel)]="model.seriesId" (ngModelChange)="modelChange.emit(model)">
            <option *ngFor="let seriesId of allSeriesIds" [value]="seriesId">{{allSeries[seriesId]?.title || 'No Series'}}</option>
          </select>
          <!-- TODO: there should be a way to clear this, issue #52 -->
        </p>
      
        <p class="right">
          <label [attr.for]="orderBy">Order by</label>
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

export class SearchStoryFormComponent {
  @Input() allSeriesIds: number[];
  @Input() allSeries: any;
  @Input() orderByOptions: any[];

  @Input() model: SearchStory;
  @Output() modelChange = new EventEmitter<SearchStory>();
}
