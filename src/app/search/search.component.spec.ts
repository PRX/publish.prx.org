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
    auth = cms().mock('prx:authorization', {});
    auth.mock('prx:default-account', {});
    auth.mockItems('prx:series', []);
    auth.mockItems('prx:series-search', []);
    auth.mockItems('prx:stories-search', []);
  });

  cit('detects no results', (fix, el, comp) => {
    expect(el).not.toContainText('Viewing all');
    expect(comp.noResults).toBe(true);
  });

  cit('searches via URL params', (fix, el, comp) => {
    const params = { tab: 'stories', perPage: 12, orderBy: 'published_at', orderDesc: false, page: 1 };
    spyOn(comp.router, 'navigate');
    comp.searchWithParams(params);
    expect(comp.router.navigate).toHaveBeenCalledWith(['search', params]);
  });

  describe('on the stories tab', () => {
    const storiesResults = new Array(15).fill({});
    beforeEach(() => {
      activatedRoute.testParams = { tab: 'stories' };
      auth.mockItems('prx:stories-search', storiesResults);
    });

    cit('loads a list of stories', (fix, el, comp) => {
      expect(comp.noResults).toBe(false);
      expect(comp.isLoaded).toBe(true);
      expect(comp.storiesResults.length).toEqual(storiesResults.length);
    });

    cit('shows paging controls', (fix, el, comp) => {
      const pagingControls = el.queryAll(By.css('.pages > .btn-link'));
      expect(pagingControls.length).toEqual(5); // 5 = two pages, two next/prev arrows, and one View All
    });
  });

  describe('on the series tab', () => {
    const seriesResults = new Array(10).fill({});
    beforeEach(() => {
      activatedRoute.testParams = { tab: 'series' };
      auth.mockItems('prx:series-search', seriesResults);
    });

    cit('loads a list of series', (fix, el, comp) => {
      expect(comp.noResults).toBe(false);
      expect(comp.isLoaded).toBe(true);
      expect(comp.seriesResults.length).toEqual(seriesResults.length);
    });
  });

  describe('with remote errors', () => {
    beforeEach(() => {
      auth.count = () => 999;
      auth.mockError('prx:stories-search', new Error('Something went terribly awry'));
      activatedRoute.testParams = { tab: 'stories' };
    });

    cit('catches and displays a search errors', (fix, el, comp) => {
      expect(comp.noResults).toBe(false);
      expect(comp.isLoaded).toBe(true);
      expect(comp.searchError).toBe(true);
      expect(el).toContainText('Your search query contains a syntax error');
    });
  });

  cit('adds wildcards to the end of searches', (fix, el, comp) => {
    expect(comp.addWildcard(null)).toEqual(null);
    expect(comp.addWildcard('')).toEqual('');
    expect(comp.addWildcard('a')).toEqual('a*');
    expect(comp.addWildcard('hello worl')).toEqual('hello worl*');
    expect(comp.addWildcard('hello worl*')).toEqual('hello worl*');
    expect(comp.addWildcard('hello worl ')).toEqual('hello worl ');
  });
});
