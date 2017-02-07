import { cit, create, provide, stubPipe, niceEl, By } from '../../../testing';
import { Router } from '@angular/router';
import { RouterStub } from '../../../testing/stub.router';
import { ToastrService } from '../../core';
import { StoryHeroComponent } from './hero.component';

describe('StoryHeroComponent', () => {

  create(StoryHeroComponent);

  provide(Router, RouterStub);
  provide(ToastrService, {success: () => {}});

  stubPipe('timeago');

  const expectDisabled = (el, text, shouldBeDisabled) => {
    let button = el.queryAll(By.css('publish-button')).find(btn => {
      return btn.nativeElement.textContent.trim() === text;
    });
    if (!button) {
      fail(`Could not find button with text: ${text}`);
    } else {
      let isDisabled = button.nativeElement.getAttribute('disabled');
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

  cit('shows edit vs create state', (fix, el, comp) => {
    expect(el).toContainText('Create Episode');
    comp.id = 1234;
    fix.detectChanges();
    expect(el).toContainText('Edit Episode');
  });

  cit('unstrictly saves new stories', (fix, el, comp) => {
    comp.story = {isNew: true, changed: () => null,  invalid: () => 'bad'};
    fix.detectChanges();
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expectDisabled(el, 'Save', false);
  });

  cit('unstrictly saves unpublished stories', (fix, el, comp) => {
    comp.story = {changed: () => null, invalid: () => 'bad'};
    fix.detectChanges();
    expect(el).toContainText('Save');
    expectDisabled(el, 'Save', true);
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expectDisabled(el, 'Save', false);
  });

  cit('strictly saves published stories', (fix, el, comp) => {
    comp.story = {publishedAt: new Date(), isPublished: () => null, changed: () => null, invalid: () => 'bad'};
    fix.detectChanges();
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
