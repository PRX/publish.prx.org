import { EventEmitter } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { cit, create } from '../../../testing';
import { SearchStoryFormComponent } from './search-story-form.component';
import { SearchStory } from '../search-story.model';
import { SearchComponent } from '../search.component';

describe('SearchStoryFormComponent', () => {

  create(SearchStoryFormComponent, false);

  cit('Initializes with search defaults', (fix, el, comp) => {
    comp.model = new SearchStory();
    comp.model.fromRouteParams({tab: SearchComponent.TAB_STORIES});
    expect(comp.model.perPage).toEqual(12);
    expect(comp.model.orderBy).toEqual('updated_at');
    expect(comp.model.orderDesc).toBe(true);
  });

  cit('Emits change with search parameters', (fix, el, comp) => {
    comp.model = new SearchStory();
    comp.modelChange = new EventEmitter<SearchStory>();
    spyOn(comp.modelChange, 'emit').and.stub();
    comp.model.fromRouteParams({tab: SearchComponent.TAB_STORIES});
    fakeAsync(function() {
      comp.model.text = 'fundraiser';
      fix.detectChanges();
      tick();
      expect(comp.modelChange.emit).toHaveBeenCalledWith(comp.model);
    });
  });

});
