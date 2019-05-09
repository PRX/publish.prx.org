import { cit, create, provide, niceEl, By } from '../../../testing';
import { StatusControlComponent } from './status-control.component';
import { Router } from '@angular/router';
import { RouterStub } from '../../../testing/stub.router';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';

describe('StatusControlComponent', () => {
  create(StatusControlComponent);

  provide(Router, RouterStub);
  provide(ModalService);
  provide(ToastrService);

  const expectDisabled = (el, text, shouldBeDisabled) => {
    let button = el.queryAll(By.css('prx-button')).find(btn => {
      return btn.nativeElement.textContent.trim() === text;
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

  cit('unstrictly saves new stories', (fix, el, comp) => {
    mockStory({isNew: true, invalid: () => 'bad'}, comp, fix);
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expectDisabled(el, 'Save', false);
  });

  cit('unstrictly saves unpublished stories', (fix, el, comp) => {
    mockStory({invalid: () => 'bad'}, comp, fix);
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expectDisabled(el, 'Save', false);
  });

  cit('strictly saves published stories', (fix, el, comp) => {
    mockStory({publishedAt: new Date(), isPublished: () => null, invalid: () => 'bad'}, comp, fix);
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => null;
    fix.detectChanges();
    expectDisabled(el, 'Save', false);
  });
});
