import { cit, create, provide, cms, By } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StoryComponent } from './story.component';
import { ModalService } from '../core';

let router = new RouterStub();
let activatedRoute = new ActivatedRouteStub();

describe('StoryComponent', () => {

  create(StoryComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);

  let modalAlertTitle: any;
  provide(ModalService, {
    alert: (a) => modalAlertTitle = a,
    prompt: (p) => modalAlertTitle = p
  });
  beforeEach(() => modalAlertTitle = null);

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:default-account', {title: 'DefaultAccountTitle'});
    auth.mock('prx:series', {title: 'ExistingSeriesTitle'});
    let story = auth.mock('prx:story', {title: 'ExistingStoryTitle', appVersion: 'v4'});
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
    activatedRoute.testParams = {series_id: 5678};
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

  cit('prompts for leaving with unsaved changes', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    fix.detectChanges();
    expect(comp.canDeactivate()).toEqual(true);
    spyOn(comp.story, 'changed').and.returnValue(true);
    expect(comp.canDeactivate() instanceof Observable).toBeTruthy();
    expect(modalAlertTitle).toMatch(/unsaved changes/i);
  });

  cit('prompts for deletion', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    fix.detectChanges();
    el.query(By.css('.delete')).nativeElement.click();
    expect(modalAlertTitle).toMatch(/really delete/i);
  });

  cit('does not prompt for unsaved changes after delete', (fix, el, comp) => {
    activatedRoute.testParams = {id: 1234};
    fix.detectChanges();
    comp.story.isDestroy = true;
    expect(comp.canDeactivate()).toEqual(true);
    expect(modalAlertTitle).toBeNull();
  });

  describe('with a v3 story', () => {

    beforeEach(() => {
      let story = auth.mock('prx:story', {title: 'SomeV3Story', appVersion: 'v3'});
      story.mockItems('prx:audio-versions', []);
      story.mockItems('prx:images', []);
    });

    cit('refuses to edit', (fix, el, comp) => {
      activatedRoute.testParams = {id: 1234};
      fix.detectChanges();
      expect(modalAlertTitle).toMatch(/cannot edit story/i);
    });

  });

});
