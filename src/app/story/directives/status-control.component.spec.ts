import { Subject } from 'rxjs';
import { cit, create, provide, niceEl, By } from '../../../testing';
import { StatusControlComponent } from './status-control.component';
import { Router } from '@angular/router';
import { RouterStub } from '../../../testing/stub.router';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';
import { Angulartics2 } from 'angulartics2';

describe('StatusControlComponent', () => {
  create(StatusControlComponent);

  provide(Router, RouterStub);
  provide(ModalService);
  provide(Angulartics2, { trackLocation: () => {}, eventTrack: new Subject<any>() });

  let toastErrorMsg: string;
  beforeEach(() => (toastErrorMsg = null));
  provide(ToastrService, { error: (m: string) => (toastErrorMsg = m) });

  const expectDisabled = (el, text, shouldBeDisabled) => {
    let button = el.queryAll(By.css('prx-button')).find((btn) => {
      return btn.nativeElement.firstChild.data.trim() === text;
    });
    if (!button) {
      fail(`Could not find button with text: ${text}`);
    } else {
      let isDisabled = button.nativeElement.disabled;
      let ngDisabled = button.nativeElement.getAttribute('ng-reflect-disabled');
      isDisabled = isDisabled || ngDisabled;
      if (shouldBeDisabled && isDisabled === null) {
        fail(`Expected disabled - ${niceEl(button)}`);
      }
      if (!shouldBeDisabled && isDisabled !== null) {
        fail(`Expected enabled - ${niceEl(button)}`);
      }
    }
  };

  const mockStory = (story, comp, fix) => {
    comp.story = story;
    comp.story.invalid = comp.story.invalid || (() => null);
    comp.story.changed = comp.story.changed || (() => false);
    comp.story.isNew = comp.story.isNew || false;
    comp.id = comp.story.isNew ? null : 1234;
    fix.detectChanges();
  };

  cit('strictly allows publishing', (fix, el, comp) => {
    comp.nextStatus = 'published';
    mockStory({ invalid: () => 'bad' }, comp, fix);
    expect(el).toContainText('Found 1 Problem');
    mockStory({ invalid: (f, strict) => (strict ? 'bad,stuff' : null) }, comp, fix);
    expect(el).toContainText('Found 2 Problems');
    mockStory({ invalid: () => null }, comp, fix);
    expectDisabled(el, 'Publish Now', false);
    comp.currentStatus = 'published';
    fix.detectChanges();
    expectDisabled(el, 'Save & Publish', true);
  });

  cit('strictly sets to published (after audio processing)', (fix, el, comp) => {
    comp.nextStatus = 'published';
    mockStory({ publishedAt: null, invalid: () => 'bad', setPublished: () => null }, comp, fix);
    spyOn(comp.story, 'setPublished').and.returnValue(new Subject());

    comp.setPublished('should not be able to publish this');
    expect(comp.story.setPublished).not.toHaveBeenCalled();
    expect(toastErrorMsg).toEqual('Unable to publish - check validation errors');
  });

  cit('unstrictly sets to unpublished (after audio processing)', (fix, el, comp) => {
    comp.nextStatus = 'unpublished';
    mockStory({ publishedAt: new Date(), invalid: () => 'bad', setPublished: () => null }, comp, fix);
    spyOn(comp.story, 'setPublished').and.returnValue(new Subject());

    comp.setUnpublished('should be able to unpublish this');
    expect(comp.story.setPublished).toHaveBeenCalledWith(false);
    expect(toastErrorMsg).toEqual(null);
  });

  cit('shows remote status messages', (fix, el, comp) => {
    comp.nextStatus = comp.currentStatus = 'scheduled';
    mockStory({ status: 'invalid', statusMessage: 'Remote invalid' }, comp, fix);
    expect(el).toContainText('Found 1 Problem');
    mockStory({ status: 'any', statusMessage: 'Remote invalid' }, comp, fix);
    expectDisabled(el, 'Save', true);
  });

  cit('unstrictly saves new stories', (fix, el, comp) => {
    comp.nextStatus = comp.currentStatus = 'draft';
    mockStory({ isNew: true, invalid: () => 'bad' }, comp, fix);
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    mockStory({ isNew: true, invalid: (f, strict) => (strict ? 'bad' : null), changed: () => true }, comp, fix);
    expectDisabled(el, 'Save', false);
  });

  cit('unstrictly saves unpublished stories', (fix, el, comp) => {
    comp.nextStatus = comp.currentStatus = 'draft';
    mockStory({ invalid: () => 'bad' }, comp, fix);
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => (strict ? 'bad' : null);
    comp.story.changed = () => true;
    fix.detectChanges();
    expectDisabled(el, 'Save', false);
  });

  cit('strictly saves published stories', (fix, el, comp) => {
    comp.nextStatus = comp.currentStatus = 'published';
    mockStory({ publishedAt: new Date(), isPublished: () => true, invalid: () => null }, comp, fix);
    expect(el).toContainText('Save & Publish');
    expectDisabled(el, 'Save & Publish', true);
    comp.story.invalid = (f, strict) => (strict ? 'bad' : null);
    fix.detectChanges();
    expectDisabled(el, 'Found 1 Problem', false);
    comp.story.invalid = (f, strict) => null;
    comp.story.changed = () => true;
    fix.detectChanges();
    expectDisabled(el, 'Save & Publish', false);
  });

  cit('it correctly determines the next step', (fix, el, comp: StatusControlComponent) => {
    comp.nextStatus = comp.currentStatus = 'draft';
    // If it's going to draft and fails normal validation, it can't be saved
    mockStory({ isNew: true, invalid: () => 'bad', changed: () => true }, comp, fix);
    expect(comp.buttons.primary.text).toEqual('Found 1 Problem');
    // If it's going to draft and passes normal validation, it can be saved
    mockStory({ isNew: true, invalid: (f, strict) => (strict ? 'bad' : null), changed: () => true }, comp, fix);
    expectDisabled(el, 'Save', false);
    // If it's going to scheduled and fails strict validation, it can't be scheduled
    comp.nextStatus = 'scheduled';
    mockStory({ releasedAt: new Date(), invalid: (f, strict) => (strict ? 'bad' : null), changed: () => true }, comp, fix);
    expect(comp.buttons.primary.text).toEqual('Found 1 Problem');
    // If it's going to scheduled and passes strict validation, it can be scheduled
    mockStory({ releasedAt: new Date(), invalid: () => null, changed: () => true }, comp, fix);
    expectDisabled(el, 'Schedule', false);
    // If it's going to published and fails strict validation, it can't be published
    comp.nextStatus = 'published';
    comp.story.invalid = (f, strict) => (strict ? 'bad' : null);
    fix.detectChanges();
    expect(comp.buttons.primary.text).toEqual('Found 1 Problem');
    // If it's going to published and passes strict validation, it can be published
    comp.story.invalid = (f, strict) => null;
    fix.detectChanges();
    expect(comp.buttons.primary.text).toEqual('Publish Now');
  });
});
