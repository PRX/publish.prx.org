import { cit, create, provide, stubPipe } from '../../../testing';
import { Router } from '@angular/router';
import { RouterStub } from '../../../testing/stub.router';
import { StoryHeroComponent } from './hero.component';

describe('StoryHeroComponent', () => {

  create(StoryHeroComponent);

  provide(Router, RouterStub);

  stubPipe('timeago');

  cit('shows edit vs create state', (fix, el, comp) => {
    expect(el).toContainText('Create Episode');
    comp.id = 1234;
    fix.detectChanges();
    expect(el).toContainText('Edit Episode');
  });

  cit('unstrictly saves new stories', (fix, el, comp) => {
    comp.story = {isNew: true,  invalid: () => 'bad'};
    fix.detectChanges();
    expect(el).toContainText('Create');
    expect(el).toContainText('Invalid episode');
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expect(el).not.toContainText('Invalid episode');
  });

  cit('unstrictly saves unpublished stories', (fix, el, comp) => {
    comp.story = {changed: () => null, invalid: () => 'bad'};
    fix.detectChanges();
    expect(el).toContainText('Save');
    expect(el).toContainText('Invalid episode');
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expect(el).not.toContainText('Invalid episode');
  });

  cit('strictly allows publishing', (fix, el, comp) => {
    comp.story = {changed: () => null, invalid: () => 'bad'};
    fix.detectChanges();
    expect(el).toContainText('Publish');
    expect(el).toContainText('Not ready to publish');
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expect(el).toContainText('Not ready to publish');
    comp.story.invalid = (f, strict) => null;
    fix.detectChanges();
    expect(el).not.toContainText('Not ready to publish');
  });

  cit('strictly saves published stories', (fix, el, comp) => {
    comp.story = {publishedAt: new Date(), isPublished: () => null, changed: () => null, invalid: () => 'bad'};
    fix.detectChanges();
    expect(el).toContainText('Save');
    expect(el).toContainText('Invalid episode');
    comp.story.invalid = (f, strict) => strict ? 'bad' : null;
    fix.detectChanges();
    expect(el).toContainText('Invalid episode');
    comp.story.invalid = (f, strict) => null;
    fix.detectChanges();
    expect(el).not.toContainText('Invalid Episode');
  });

});
