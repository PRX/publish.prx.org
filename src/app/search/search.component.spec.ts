import { ActivatedRoute, Router } from '@angular/router';
import { By, cit, create, cms, provide } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { SearchComponent } from './search.component';

let activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();

describe('SearchComponent', () => {

  create(SearchComponent);

  provide(Router, RouterStub);
  provide(ActivatedRoute, activatedRoute);

  let auth;
  beforeEach(() => {
    activatedRoute.testParams = {};
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {});
    auth.mockItems('prx:series', []);
    auth.mockItems('prx:stories', []);
  });

  cit('detects no results', (fix, el, comp) => {
    expect(el).not.toContainText('Viewing all');
    expect(comp.noResults).toBe(true);
  });

  describe('on the stories tab', () => {

    let storiesResults = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    beforeEach(() => {
      activatedRoute.testParams = {tab: 'stories'};
      auth.mockItems('prx:stories', storiesResults);
    });

    cit('loads a list of stories', (fix, el, comp) => {
      expect(comp.noResults).toBe(false);
      expect(comp.isLoaded).toBe(true);
      expect(comp.storiesResults.length).toEqual(storiesResults.length);
    });

    cit('shows paging controls', (fix, el, comp) => {
      let pagingControls = el.queryAll(By.css('.pages > .btn-link'));
      expect(pagingControls.length).toEqual(5); // 5 = two pages, two next/prev arrows, and one View All
    });

  });

  describe('on the series tab', () => {

    let seriesResults = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    beforeEach(() => {
      activatedRoute.testParams = {tab: 'series'};
      auth.mockItems('prx:series', seriesResults);
    });

    cit('loads a list of series', (fix, el, comp) => {
      expect(comp.noResults).toBe(false);
      expect(comp.isLoaded).toBe(true);
      expect(comp.seriesResults.length).toEqual(seriesResults.length);
    });

  });

});
