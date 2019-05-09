import { cit, create, provide, stubPipe, By } from '../../../testing';
import { Angulartics2 } from 'angulartics2';
import { ModalService, ToastrService } from 'ngx-prx-styleguide';
import { StoryStatusComponent } from './status.component';
import * as moment from 'moment';

describe('StoryStatusComponent', () => {

  create(StoryStatusComponent);

  stubPipe('date');

  let modalAlertBody: any;
  provide(ModalService, {
    show: (data) => modalAlertBody = data.body,
    alert: (title, body) => modalAlertBody = body,
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

  cit('determines the appropriate status based on story', (fix, el, comp: StoryStatusComponent) => {
    mockStory({isNew: true}, comp, fix);
    expect(Object.entries(comp.storyStatus).filter(([_, stat]) => stat.active).length).toBe(1);
    expect(comp.currentStatus.name).toBe('draft');
    mockStory({publishedAt: new Date(), isPublished: () => null}, comp, fix);
    expect(Object.entries(comp.storyStatus).filter(([_, stat]) => stat.active).length).toBe(1);
    expect(comp.currentStatus.name).toBe('scheduled');
    mockStory({publishedAt: new Date(), isPublished: () => true}, comp, fix);
    expect(Object.entries(comp.storyStatus).filter(([_, stat]) => stat.active).length).toBe(1);
    expect(comp.currentStatus.name).toBe('published');
  });

  cit('fails gracefully if status has not yet been determined', (fix, el, comp: StoryStatusComponent) => {
    expect(comp.currentStatus).toBe(null);
  });

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
    expect(el).toContainText('Ready to publish');
  });

  cit('shows remote status messages', (fix, el, comp) => {
    mockStory({status: 'invalid', statusMessage: 'Remote invalid'}, comp, fix);
    expect(el).toContainText('Publish');
    expect(el).toContainText('Found 1 problem');
    mockStory({status: 'any', statusMessage: 'Remote invalid'}, comp, fix);
    expect(el).toContainText('Ready to publish');
  });

  cit('updates showReleasedAt based on story releasedAt', (fix, el, comp) => {
    const tomorrow = new Date(moment().add(1, 'days').valueOf());
    const scheduledStory = {
      publishedAt: tomorrow,
      releasedAt: tomorrow,
      isPublished: () => false
    };
    mockStory(scheduledStory, comp, fix);
    expect(comp.showReleasedAt).toBeTruthy();
    comp.story.releasedAt = null;
    fix.detectChanges()
    expect(comp.showReleasedAt).toBeFalsy();
  });

  cit('alerts when unscheduling a future published episode', (fix, el, comp) => {
    const tomorrow = new Date(moment().add(1, 'days').valueOf());
    const scheduledStory = {
      publishedAt: tomorrow,
      releasedAt: tomorrow,
      changed: () => true,
      isPublished: () => false
    };
    mockStory(scheduledStory, comp, fix);
    comp.showReleasedAt = true;
    fix.detectChanges();

    expect(modalAlertBody).toBeNull();
    let cancelReleaseDate = el.query(By.css('#showReleasedAt')).nativeElement;
    cancelReleaseDate.click();
    expect(modalAlertBody).toMatch(/will unpublish/i);
    expect(comp.story.releasedAt).toBeNull();
  });
});
