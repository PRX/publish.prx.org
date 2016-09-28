import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { cit, create, cms, By, provide } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { SearchComponent } from './search.component';

import { AuthService } from '../core/auth/auth.service';
import { CmsService } from '../core/cms/cms.service';

let authToken = new Subject<string>();
let cmsToken: string = null;
let activatedRoute: ActivatedRouteStub;

describe('SearchComponent', () => {

  create(SearchComponent);

  provide(AuthService, {token: authToken});
  provide(CmsService, {
    setToken: token => cmsToken = token,
    account: new Subject<any>()
  });
  provide(Router, RouterStub);

  let auth;
  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {};
    provide(ActivatedRoute, activatedRoute);
    auth = cms.mock('prx:authorization', {});
    auth.mockItems('prx:series', []);
    auth.mockItems('prx:stories', []);
  });

  cit('shows a loading spinner', (fix, el, comp) => {
    expect(el).not.toQuery('publish-spinner');
    comp.isLoaded = false;
    fix.detectChanges();
    expect(el).toQuery('publish-spinner');
  });

  cit('shows a no results indicator', (fix, el, comp) => {
    expect(el).not.toContainText('Viewing all');
    expect(el).toContainText('No Stories match your search');
    expect(el).toQuery('publish-story-list');
    expect(el).toQueryAttr('publish-story-list', 'noStories', 'true');
  });

  describe('on the stories tab', () => {

    beforeEach(() => {
      activatedRoute.testParams = {tab: 'stories'};
      auth.mockItems('prx:stories', [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
    });

    cit('shows a list of stories', (fix, el, comp) => {
      expect(el).toContainText('View All 15');
      let stories = el.queryAll(By.css('publish-story-card'));
      expect(stories.length).toEqual(3);
    });

    cit('shows paging controls', (fix, el, comp) => {
      let pagingControls = el.queryAll(By.css('.pages > .btn-link'));
      expect(pagingControls.length).toEqual(4);
    });

  });

  describe('on the series tab', () => {

    beforeEach(() => {
      activatedRoute.testParams = {tab: 'series'};
      auth.mockItems('prx:series', [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
    });

    cit('shows a list of series', (fix, el, comp) => {
      expect(el).toContainText('Viewing All 10');
      let series = el.queryAll(By.css('publish-series-card'));
      expect(series.length).toEqual(10);
    });

  });

});
