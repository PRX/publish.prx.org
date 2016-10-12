import { EventEmitter } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { cit, create } from '../../../testing';
import { SearchSeriesFormComponent } from './search-series-form.component';
import { SearchSeries } from '../search-series.model';
import { SearchComponent } from '../search.component';

describe('SearchSeriesFormComponent', () => {

  create(SearchSeriesFormComponent, false);

  cit('Initializes with search defaults', (fix, el, comp) => {
    comp.model = new SearchSeries();
    comp.model.fromRouteParams({tab: SearchComponent.TAB_SERIES});
    expect(comp.model.perPage).toEqual(10);
    expect(comp.model.orderBy).toEqual('updated_at');
    expect(comp.model.orderDesc).toBe(true);
  });

  cit('Emits change with search parameters', (fix, el, comp) => {
    comp.model = new SearchSeries();
    comp.modelChange = new EventEmitter<SearchSeries>();
    spyOn(comp.modelChange, 'emit').and.stub();
    comp.model.fromRouteParams({tab: SearchComponent.TAB_SERIES});
    fakeAsync(function() {
      comp.model.text = 'fundraiser';
      fix.detectChanges();
      tick();
      expect(comp.modelChange.emit).toHaveBeenCalledWith(comp.model);
    });
  });

});
