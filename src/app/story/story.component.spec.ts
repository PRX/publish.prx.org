import { cit, create, provide, cms, By } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StoryComponent } from './story.component';
import { ModalService, ToastrService } from '../core';

let router = new RouterStub();
let activatedRoute = new ActivatedRouteStub();

describe('StoryComponent', () => {

  create(StoryComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);

  let modalAlertTitle: any;
  provide(ModalService, {
    alert: (a) => modalAlertTitle = a,
    confirm: (p) => modalAlertTitle = p
  });
  beforeEach(() => modalAlertTitle = null);
  provide(ToastrService, {success: () => {}});

  let auth, series, story;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {title: 'DefaultAccountTitle'});
    series = auth.mock('prx:series', {title: 'ExistingSeriesTitle'});
    story = auth.mock('prx:story', {title: 'ExistingStoryTitle', appVersion: 'v4'});
    story.mockItems('prx:audio-versions', []);
    story.mockItems('prx:images', []);
  });

  cit('renders an existing story', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    fix.detectChanges();
    expect(comp.id).toEqual(1234);
    expect(comp.seriesId).toBeFalsy();
    expect(comp.story.title).toEqual('ExistingStoryTitle');
  });

  cit('renders a new story in a series', (fix, el, comp) => {
    activatedRoute.testParams = {seriesId: 5678};
    fix.detectChanges();
    expect(comp.id).toBeFalsy();
    expect(comp.seriesId).toEqual(5678);
    expect(comp.story.title).toBeUndefined();
    expect(comp.story.parent['title']).toEqual('ExistingSeriesTitle');
  });

  cit('renders a new standalone story', (fix, el, comp) => {
    activatedRoute.testParams = {};
    fix.detectChanges();
    expect(comp.id).toBeFalsy();
    expect(comp.seriesId).toBeFalsy();
    expect(comp.story.title).toBeUndefined();
    expect(comp.story.parent).toBeNull();
  });

  cit('confirms discarding unsaved changes before leaving', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    fix.detectChanges();
    expect(comp.canDeactivate()).toEqual(true);
    spyOn(comp.story, 'changed').and.returnValue(true);
    expect(comp.canDeactivate() instanceof Observable).toBeTruthy();
    expect(modalAlertTitle).toMatch(/unsaved changes/i);
  });

  cit('does not confirm for unsaved changes after delete', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    fix.detectChanges();
    comp.story.isDestroy = true;
    expect(comp.canDeactivate()).toEqual(true);
    expect(modalAlertTitle).toBeNull();
  });

  describe('with a v3 story', () => {

    beforeEach(() => {
      story = auth.mock('prx:story', {title: 'SomeV3Story', appVersion: 'v3'});
      story.mockItems('prx:audio-versions', []);
      story.mockItems('prx:images', []);
    });

    cit('refuses to edit', (fix, el, comp) => {
      activatedRoute.testParams = {id: 1234};
      fix.detectChanges();
      expect(modalAlertTitle).toMatch(/cannot edit episode/i);
    });

  });

  cit('shows the player tab for existing stories', (fix, el, comp) => {
    activatedRoute.testParams = {};
    fix.detectChanges();
    expect(el).not.toContainText('Embeddable Player');
    comp.id = 1234;
    comp.showDistributionTabs();
    fix.detectChanges();
    expect(el).toContainText('Embeddable Player');
  });

  cit('shows the podcast distribution tab for existing stories', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    story.mockItems('prx:distributions', [{kind: 'foobar'}]);
    fix.detectChanges();
    expect(el).not.toContainText('Podcast Distribution');
    story.mockItems('prx:distributions', [{kind: 'foobar'}, {kind: 'episode'}]);
    comp.loadStory();
    fix.detectChanges();
    expect(el).toContainText('Podcast Distribution');
  });

  cit('shows the podcast distribution tab for new stories', (fix, el, comp) => {
    activatedRoute.testParams = {seriesId: 5678};
    series.mockItems('prx:distributions', [{kind: 'foobar'}]);
    fix.detectChanges();
    expect(el).not.toContainText('Podcast Distribution');
    series.mockItems('prx:distributions', [{kind: 'foobar'}, {kind: 'podcast'}]);
    comp.loadStory();
    fix.detectChanges();
    expect(el).toContainText('Podcast Distribution');
  });

});
