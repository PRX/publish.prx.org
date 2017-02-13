import { cit, create, provide, stubPipe } from '../../../testing';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { RouterStub } from '../../../testing/stub.router';
import { ModalService, ToastrService } from '../../core';
import { StoryStatusComponent } from './status.component';

describe('StoryStatusComponent', () => {

  create(StoryStatusComponent);

  provide(Router, RouterStub);

  stubPipe('date');

  let modalAlertBody: any;
  provide(ModalService, {
    show: (data) => modalAlertBody = data.body,
    confirm: (title, body) => modalAlertBody = body
  });
  beforeEach(() => modalAlertBody = null);
  provide(ToastrService);
  provide(Angulartics2, {trackLocation: () => {}});

  const mockStory = (story, comp, fix) => {
    comp.story = story;
    comp.story.invalid = comp.story.invalid || (() => null);
    comp.story.changed = comp.story.changed || (() => false);
    comp.story.isNew = comp.story.isNew || false;
    comp.id = comp.story.isNew ? null : 1234;
    fix.detectChanges();
  };

  cit('shows story status', (fix, el, comp) => {
    mockStory({isNew: true}, comp, fix);
    expect(el).toQueryText('.status', 'Draft');
    mockStory({isNew: false}, comp, fix);
    expect(el).toQueryText('.status', 'Draft');
    mockStory({publishedAt: new Date(), isPublished: () => false}, comp, fix);
    expect(el).toQueryText('.status', 'Scheduled');
    mockStory({publishedAt: new Date(), isPublished: () => true}, comp, fix);
    expect(el).toQueryText('.status', 'Published');
  });

  cit('strictly allows publishing', (fix, el, comp) => {
    mockStory({invalid: () => 'bad'}, comp, fix);
    expect(el).toContainText('Publish');
    expect(el).toContainText('Found 1 problem');
    mockStory({invalid: (f, strict) => strict ? 'bad,stuff' : null}, comp, fix);
    expect(el).toContainText('Found 2 problems');
    mockStory({invalid: () => null}, comp, fix);
    fix.detectChanges();
    expect(el).toContainText('Ready to publish');
  });

});
