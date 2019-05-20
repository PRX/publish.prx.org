import { cit, create, provide, niceEl, By } from '../../../testing';
import { StatusControlComponent } from './status-control.component';
import { Router } from '@angular/router';
import { RouterStub } from '../../../testing/stub.router';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';
import { Angulartics2 } from 'angulartics2';

fdescribe('StatusControlComponent', () => {
  create(StatusControlComponent);

  provide(Router, RouterStub);
  provide(ModalService);
  provide(ToastrService);
  provide(Angulartics2, {trackLocation: () => {}});

  const expectDisabled = (el, text, shouldBeDisabled) => {
    let button = el.queryAll(By.css('prx-button')).find(btn => {
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
    mockStory({invalid: () => 'bad'}, comp, fix);
    expect(el).toContainText('Found 1 problem');
    mockStory({invalid: (f, strict) => strict ? 'bad,stuff' : null}, comp, fix);
    expect(el).toContainText('Found 2 problems');
    mockStory({invalid: () => null}, comp, fix);
    expect(el).toContainText('Ready to publish');
  });

  cit('shows remote status messages', (fix, el, comp) => {
    mockStory({status: 'invalid', statusMessage: 'Remote invalid'}, comp, fix);
    expect(el).toContainText('Found 1 problem');
    mockStory({status: 'any', statusMessage: 'Remote invalid'}, comp, fix);
    expect(el).toContainText('Ready to publish');
  });

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

  cit('it correctly determines the next step', (fix, el, comp: StatusControlComponent) => {
    comp.nextStatus = { active: false, name: 'draft', class: 'draft', text: 'Draft' };
    // If it's going to draft and fails normal validation, it can't be saved
    mockStory({isNew: true, invalid: () => 'bad', changed: () => true}, comp, fix);
    expect(comp.determineNextStep().error).not.toBeFalsy();
    // If it's going to draft and passes normal validation, it can be saved
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    expect(comp.determineNextStep().error).toMatch(/Found.*problem/);
    // If it's going to scheduled and fails strict validation, it can't be scheduled
    // If it's going to scheduled and passes strict validation, it can be scheduled
    // If it's going to published and fails strict validation, it can't be published
    // If it's going to published and passes strict validation, it can be published
  })
});
